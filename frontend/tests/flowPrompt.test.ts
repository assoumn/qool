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
