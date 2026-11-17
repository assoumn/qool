import { request as httpRequest } from 'node:http';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVeoClient, validateInput } from '../src/veo.js';
import { createApp } from '../src/app.js';

const image = { mimeType: 'image/png', bytesBase64Encoded: Buffer.from([137,80,78,71,13,10,26,10,0]).toString('base64') };
const input = { prompt: "مرحبا guys! C'est magnifique!", image, confirmCost: true };
const path = 'projects/test-project/locations/us-central1/publishers/google/models/veo-3.1-fast-generate-001';
function client(fetchImpl) { return createVeoClient({ project:'test-project', location:'us-central1', model:'veo-3.1-fast-generate-001', getToken: async () => 'test-token', fetchImpl }); }

test('Vertex start request includes exact prompt, image, audio, duration and a single sample', async () => {
  const veo = client(async (url, options) => {
    assert.equal(url, `https://us-central1-aiplatform.googleapis.com/v1/${path}:predictLongRunning`);
    const body = JSON.parse(options.body);
    assert.deepEqual(body.instances, [{prompt:input.prompt,image}]);
    assert.equal(body.parameters.generateAudio,true);
    assert.equal(body.parameters.durationSeconds,8);
    assert.equal(body.parameters.sampleCount,1);
    assert.equal(options.headers.Authorization,'Bearer test-token');
    return Response.json({name:`${path}/operations/abc`});
  });
  assert.equal(await veo.start(input),`${path}/operations/abc`);
});
test('poll translates running, completed MP4, and filtered results', async () => {
  const results = [{done:false},{done:true,response:{videos:[{mimeType:'video/mp4',bytesBase64Encoded:Buffer.from('mp4').toString('base64')}]}},{done:true,response:{raiMediaFilteredCount:1}},{done:true,error:{message:'private upstream details'}}];
  const veo = client(async (url, options) => {
    assert.ok(url.endsWith(':fetchPredictOperation'));
    assert.equal(JSON.parse(options.body).operationName,`${path}/operations/abc`);
    return Response.json(results.shift());
  });
  assert.deepEqual(await veo.poll(`${path}/operations/abc`),{status:'running'});
  assert.equal((await veo.poll(`${path}/operations/abc`)).video.toString(),'mp4');
  assert.equal((await veo.poll(`${path}/operations/abc`)).status,'failed');
  assert.ok(!(await veo.poll(`${path}/operations/abc`)).error.includes('private'));
});
test('validation rejects empty prompts, unsupported images, invalid bytes and oversized images', () => {
  assert.throws(()=>validateInput({...input,prompt:' '}),/prompt/);
  assert.throws(()=>validateInput({...input,image:{...image,mimeType:'image/svg+xml'}}),/JPG or PNG/);
  assert.throws(()=>validateInput({...input,image:{...image,bytesBase64Encoded:'bad'}}),/encoding/);
  assert.throws(()=>validateInput({...input,image:{...image,bytesBase64Encoded:Buffer.from('not png').toString('base64')}}),/content/);
  assert.throws(()=>validateInput({...input,image:{...image,bytesBase64Encoded:'A'.repeat(14*1024*1024+4)}}),/large/);
});
test('sanitizes access/quota errors and authentication failures', async () => {
  for (const status of [400,401,403,404,429,500]) {
    const veo=client(async()=>new Response('SECRET upstream detail',{status}));
    await assert.rejects(()=>veo.start(input),error=>!error.message.includes('SECRET'));
  }
  const veo=createVeoClient({project:'test-project',location:'us-central1',model:'veo-test',getToken:async()=>{throw Error('SECRET');}});
  await assert.rejects(()=>veo.start(input),/authentication failed/);
});

async function withApp(t, options) {
  const app=createApp({model:'veo-test',...options});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>app.close(resolve)));
  const base=`http://127.0.0.1:${app.address().port}`;
  const request = (path, options={})=>fetch(base+path,options);
  request.badHostStatus = () => new Promise((resolve, reject) => {
    const req = httpRequest(base + '/api/video-config', { headers: { Host: 'evil.example' } }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject); req.end();
  });
  return request;
}
const headers={'Content-Type':'application/json',Origin:'http://localhost:5173'};
test('disabled backend does not call Google; rejects wrong origins and hosts',async t=>{
  const request=await withApp(t,{enabled:false,client:{start(){throw Error('must not call');}}});
  assert.equal((await (await request('/api/video-config')).json()).enabled,false);
  assert.equal((await request('/api/videos',{method:'POST',headers,body:JSON.stringify(input)})).status,503);
  assert.equal((await request('/api/videos',{method:'POST',headers:{...headers,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal(await request.badHostStatus(),403);
});
test('HTTP generation requires consent, prevents duplicate jobs, polls, downloads exact MP4, expires jobs',async t=>{
  let clock=0,starts=0,polls=0;
  const request=await withApp(t,{enabled:true,now:()=>clock,client:{
    async start(){starts++;return `${path}/operations/test`;},
    async poll(){polls++;return {status:'succeeded',video:Buffer.from('exact video bytes')};},
  }});
  const post=body=>request('/api/videos',{method:'POST',headers,body:JSON.stringify(body)});
  assert.equal((await post({...input,confirmCost:false})).status,400);
  assert.equal(starts,0);
  const created=await post(input); assert.equal(created.status,202);
  const job=await created.json(); assert.equal(job.status,'running');
  assert.equal((await post(input)).status,409); assert.equal(starts,1);
  assert.equal((await request(`/api/videos/${job.id}/content`)).status,409);
  const ready=await (await request(`/api/videos/${job.id}`)).json();
  assert.equal(ready.status,'succeeded');assert.ok(!JSON.stringify(ready).includes('/operations/'));
  const video=await request(ready.videoUrl); assert.equal(video.headers.get('content-type'),'video/mp4');
  assert.equal(await video.text(),'exact video bytes');assert.equal(polls,1);
  assert.equal((await post(input)).status,429);
  clock=3600001;
  assert.equal((await request(`/api/videos/${job.id}`)).status,404);
});
test('invalid JSON and missing origins cannot submit jobs',async t=>{
  const request=await withApp(t,{enabled:true,client:{start(){throw Error('must not call');}}});
  assert.equal((await request('/api/videos',{method:'POST',headers,body:'broken'})).status,400);
  assert.equal((await request('/api/videos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})).status,403);
});

test('validates a realistic large image without regex stack overflow and rejects decoded size above 10 MB', () => {
  const bytes = Buffer.alloc(1024 * 1024);
  Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);
  assert.equal(validateInput({ ...input, image: { ...image, bytesBase64Encoded: bytes.toString('base64') } }).image.mimeType, 'image/png');
  assert.throws(() => validateInput({ ...input, image: { ...image, bytesBase64Encoded: Buffer.alloc(10 * 1024 * 1024 + 1).toString('base64') } }), /10 MB/);
});
