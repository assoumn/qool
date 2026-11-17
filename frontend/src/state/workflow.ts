import { createContext, useContext } from 'react';

export interface Workflow {
  portrait: string;
  portraitName: string;
  dialogue: string;
  language: string;
  accent: string;
  voice: string;
  style: string;
  speed: string;
  audio: File | null;
}
export const defaults: Workflow = {
  portrait: '', portraitName: '', dialogue: '', language: 'Lebanese Arabic',
  accent: 'Lebanese', voice: 'Warm & natural', style: 'natural', speed: 'normal', audio: null,
};
export const WorkflowContext = createContext<{
  data: Workflow;
  update: (patch: Partial<Workflow>) => void;
  reset: () => void;
} | null>(null);
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('Workflow provider is missing');
  return context;
}
