import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateFlowPrompt, estimateSeconds, FLOW_URL } from '../src/services/flowPromptService.ts';
import { defaults } from '../src/state/workflow.ts';

const dialogue = "مرحبا guys! كيفكن اليوم؟ عندي surprise كتير حلوة إلكن. C'est magnifique!\n  Keep spaces.  ";
const draft = { ...defaults, portrait: '/portrait.png', portraitName: 'My portrait.png', dialogue };
test('preserves exact mixed-language dialogue and portrait context', () => {
  const prompt = generateFlowPrompt(draft);
  assert.ok(prompt.includes(`--- BEGIN EXACT DIALOGUE ---\n${dialogue}\n--- END EXACT DIALOGUE ---`));
  for (const instruction of ['My portrait.png', 'Lebanese Arabic pronunciation', 'lip synchronization', 'hairstyle', 'skin tone', 'clothing', 'blinking', 'stable camera', 'English, and French', 'not guaranteed']) assert.ok(prompt.includes(instruction), instruction);
});
test('incorporates all preferences without imposing Lebanese on other languages', () => {
  const prompt = generateFlowPrompt({ ...draft, language: 'French', accent: 'Parisian', voice: 'Soft & friendly', style: 'calm', speed: 'slow' });
  for (const value of ['French', 'Parisian', 'Soft & friendly', 'calm', 'slow']) assert.ok(prompt.includes(value));
  assert.ok(!prompt.includes('Use natural Lebanese Arabic pronunciation'));
});
test('rejects absent portrait and whitespace dialogue', () => {
  assert.throws(() => generateFlowPrompt({ ...draft, portrait: '' }), /portrait/);
  assert.throws(() => generateFlowPrompt({ ...draft, dialogue: ' \n ' }), /dialogue/);
});
test('estimates duration based on speaking speed', () => {
  assert.equal(estimateSeconds('', 'normal'), 0);
  assert.ok(estimateSeconds(dialogue, 'slow') > estimateSeconds(dialogue, 'fast'));
  assert.ok(estimateSeconds('word '.repeat(40), 'normal') > 8);
});
test('explicitly explains audio is not attached and uses official Flow destination', () => {
  const audio = new File(['test'], 'reference.wav', { type: 'audio/wav' });
  assert.ok(generateFlowPrompt({ ...draft, audio }).includes('not attached to this prompt'));
  assert.equal(FLOW_URL, 'https://labs.google/fx/tools/flow');
});

test('Lebanese prompts include spoken-dialect guidance and the requested mneh cue without changing dialogue', () => {
  const exact = "  صباحو guys! كيفكن اليوم مناح؟ عندي surprise كتير حلوة إلكن. C'est incroyable!\n";
  const prompt = generateFlowPrompt({ ...draft, dialogue: exact });
  assert.ok(prompt.includes('everyday spoken Lebanese'));
  assert.ok(prompt.includes('Do not add formal case endings'));
  assert.ok(prompt.includes('"mneh" (mneḥ)'));
  assert.ok(prompt.includes('NOT "mnah"'));
  assert.ok(prompt.includes(`--- BEGIN EXACT DIALOGUE ---\n${exact}\n--- END EXACT DIALOGUE ---`));
  assert.ok(prompt.indexOf('PRONUNCIATION DIRECTION') < prompt.indexOf('--- BEGIN EXACT DIALOGUE ---'));
});
test('word cues match complete Arabic words, including diacritics, but do not leak into unrelated dialogue', () => {
  assert.ok(generateFlowPrompt({ ...draft, dialogue: 'كيفكن، مْناح؟' }).includes('Requested pronunciation for مناح'));
  for (const dialogue of ['مرحبا!', 'مناحي', 'المناح']) assert.ok(!generateFlowPrompt({ ...draft, dialogue }).includes('Requested pronunciation for مناح'));
});
test('other accents do not receive Lebanese guidance, but mixed languages with a Lebanese accent do', () => {
  const other = generateFlowPrompt({ ...draft, language: 'Modern Standard Arabic', accent: 'Modern Standard Arabic', dialogue: 'مناح' });
  assert.ok(!other.includes('PRONUNCIATION DIRECTION'));
  const mixed = generateFlowPrompt({ ...draft, language: 'Mixed languages', accent: 'Lebanese', dialogue: 'مناح guys?' });
  assert.ok(mixed.includes('"mneh" (mneḥ)'));
});
test('custom pronunciation notes take priority, stay outside dialogue and work with older saved drafts', () => {
  const prompt = generateFlowPrompt({ ...draft, pronunciationNotes: 'surprise: use French pronunciation.' });
  assert.ok(prompt.includes('take priority over general pronunciation cues'));
  assert.ok(prompt.includes('surprise: use French pronunciation.'));
  assert.ok(!prompt.split('--- BEGIN EXACT DIALOGUE ---')[1].split('--- END EXACT DIALOGUE ---')[0].includes('use French pronunciation'));
  assert.doesNotThrow(() => generateFlowPrompt({ ...draft, pronunciationNotes: undefined }));
  const french = generateFlowPrompt({ ...draft, language: 'French', accent: 'Parisian', pronunciationNotes: 'Qool = cool' });
  assert.ok(french.includes('Qool = cool'));
  assert.ok(!french.includes('everyday spoken Lebanese'));
});
