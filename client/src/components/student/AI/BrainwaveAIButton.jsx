// ---------------------------------------------------------------------------
// BrainwaveAIButton.jsx
// The floating "Ask BrainWave AI" button shown on the Student Player page.
// Fixed to the bottom-right so it never occupies layout space.
// ---------------------------------------------------------------------------

import React from 'react';
import { Bot } from 'lucide-react';

export const BrainwaveAIButton = ({ onClick, label = 'Ask BrainWave AI' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="group fixed bottom-5 right-4 z-[85] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 pl-3.5 pr-4 text-sm font-semibold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40 focus:outline-none focus:ring-4 focus:ring-orange-300/50 active:scale-95 sm:bottom-7 sm:right-7 sm:py-3 sm:pl-4 sm:pr-5"
  >
    <span className="relative flex h-6 w-6 items-center justify-center">
      <Bot className="h-5 w-5" />
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-orange-500" />
    </span>
    <span className="hidden sm:inline">{label}</span>
    <span className="sm:hidden">Ask AI</span>
  </button>
);