// ---------------------------------------------------------------------------
// AIQuickActions.jsx
// The five quick action chips (Explain Simply, Summarize, Give Example,
// Important Points, Quiz Me). Each chip sends a curated prompt tuned for the
// current lecture.
// ---------------------------------------------------------------------------

import React from 'react';
import {
  FileText,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Star,
} from 'lucide-react';
import { QUICK_ACTIONS } from './quickActions';

const ACTION_ICONS = {
  explain: Lightbulb,
  summarize: FileText,
  example: Sparkles,
  points: Star,
  quiz: HelpCircle,
};

export const AIQuickActions = ({ onSelect, disabled = false }) => (
  <div className="flex flex-wrap gap-2">
    {QUICK_ACTIONS.map((action) => {
      const Icon = ACTION_ICONS[action.id] || Sparkles;
      return (
        <button
          key={action.id}
          type="button"
          onClick={() => onSelect(action.prompt)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon className="h-3.5 w-3.5" />
          {action.label}
        </button>
      );
    })}
  </div>
);