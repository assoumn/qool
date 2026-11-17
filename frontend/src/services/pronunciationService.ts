import type { Workflow } from '../state/workflow';

export function pronunciationInstructions(data: Workflow): string {
  const lebanese = data.language === 'Lebanese Arabic' || /\blebanese\b/i.test(data.accent);
  const notes = data.pronunciationNotes?.trim();
  if (!lebanese && !notes) return '';

  const instructions = [
    'PRONUNCIATION DIRECTION — production instructions only; do not read this section aloud.',
  ];
  if (lebanese) {
    instructions.push(
      'Use natural Lebanese Arabic pronunciation: everyday spoken Lebanese with a relaxed conversational rhythm, connected speech, and Lebanese vowel patterns. Avoid formal Modern Standard Arabic delivery or drifting into another regional Arabic accent.',
      'Preserve the written words, but pronounce Lebanese words as spoken Lebanese rather than reading their spelling with default formal-Arabic vowels. Do not add formal case endings or replace dialect words with formal equivalents.',
      'Keep English and French words in their original languages, switching smoothly back into the same Lebanese voice and rhythm.',
    );
    // Normalize only for word detection. The original dialogue is never normalized or rewritten.
    const words = data.dialogue.normalize('NFC').match(/[\p{L}\p{M}]+/gu) || [];
    const hasMneh = words.some(word => word.replace(/[\u064B-\u065F\u0670\u0640]/gu, '') === 'مناح');
    if (hasMneh) instructions.push(
      'Requested pronunciation for مناح: "mneh" (mneḥ), with an "eh" vowel and the final Arabic ح sound; NOT "mnah" or "manaah". Keep the written word مناح unchanged; do not replace it with منيح. This cue specifies the user’s preferred pronunciation.',
    );
  }
  if (notes) instructions.push(`User pronunciation notes (take priority over general pronunciation cues; apply to the existing words without adding spoken content):\n${notes}`);
  instructions.push('Romanized spellings above are pronunciation cues only. Speak the exact dialogue below; do not speak the guide, translate the dialogue, or insert the romanized spellings into it.');
  return instructions.join('\n');
}
