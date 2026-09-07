// ---------------------------------------------------------------------------
// quickActions.js
// The five BrainWave AI quick actions and the curated prompt each sends.
// Mirrors the web client's quickActions.js.
// ---------------------------------------------------------------------------

export const QUICK_ACTIONS = [
  {
    id: 'explain',
    label: 'Explain Simply',
    prompt:
      'Explain the current lecture in very simple terms, as if I am a complete beginner. Use a short analogy and one concrete example.',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    prompt:
      'Give me a concise summary of the current lecture and highlight the most important concepts.',
  },
  {
    id: 'example',
    label: 'Give Example',
    prompt:
      'Give me practical examples that help me understand the main concepts in this lecture.',
  },
  {
    id: 'points',
    label: 'Important Points',
    prompt:
      'List the most important points I should remember from this lecture for revision.',
  },
  {
    id: 'quiz',
    label: 'Quiz Me',
    prompt:
      'Create 5 practice questions based on the current lecture. Do not reveal the answers immediately. Ask me one question at a time and evaluate my responses.',
  },
];