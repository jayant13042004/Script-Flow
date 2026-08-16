import type { ScriptSection } from '../types';

export interface Framework {
  id: string;
  name: string;
  description: string;
  sections: Omit<ScriptSection, 'id'>[];
}

export const frameworks: Framework[] = [
  {
    id: 'hook-problem-solution-cta',
    name: 'Hook → Problem → Solution → CTA',
    description: 'Classic problem-solving structure. Great for educational and tutorial content.',
    sections: [
      { title: 'Hook', content: '', order: 0 },
      { title: 'Problem', content: '', order: 1 },
      { title: 'Solution', content: '', order: 2 },
      { title: 'Call to Action', content: '', order: 3 },
    ]
  },
  {
    id: 'hook-story-lesson-cta',
    name: 'Hook → Story → Lesson → CTA',
    description: 'Engage emotionally with a story before delivering the core message.',
    sections: [
      { title: 'Hook', content: '', order: 0 },
      { title: 'Story', content: '', order: 1 },
      { title: 'Lesson', content: '', order: 2 },
      { title: 'Call to Action', content: '', order: 3 },
    ]
  },
  {
    id: 'hook-agitate-solve-cta',
    name: 'Hook → Agitate → Solve → CTA',
    description: 'Highlight a pain point, make it worse, then offer your solution.',
    sections: [
      { title: 'Hook', content: '', order: 0 },
      { title: 'Agitate', content: '', order: 1 },
      { title: 'Solve', content: '', order: 2 },
      { title: 'Call to Action', content: '', order: 3 },
    ]
  },
  {
    id: 'the-3-step-framework',
    name: 'The 3-Step Framework',
    description: 'A simple, highly digestible structure for quick tips and tutorials.',
    sections: [
      { title: 'Hook', content: '', order: 0 },
      { title: 'Step 1', content: '', order: 1 },
      { title: 'Step 2', content: '', order: 2 },
      { title: 'Step 3', content: '', order: 3 },
      { title: 'Call to Action', content: '', order: 4 },
    ]
  },
  {
    id: 'myth-vs-reality',
    name: 'Myth vs Reality',
    description: 'Debunk common misconceptions to position yourself as an authority.',
    sections: [
      { title: 'Hook', content: '', order: 0 },
      { title: 'The Myth', content: '', order: 1 },
      { title: 'The Reality', content: '', order: 2 },
      { title: 'The Proof', content: '', order: 3 },
      { title: 'Call to Action', content: '', order: 4 },
    ]
  }
];
