// ---------------------------------------------------------------------------
// BrainwaveAIDrawer.jsx
// The slide-in chat drawer. Full-screen on mobile, 400px on desktop.
// Contains: header (course/lecture context + New Chat + Close), message list,
// welcome state with quick actions, and the input bar.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { Bot, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { AIMessage } from './AIMessage';
import { AIQuickActions } from './AIQuickActions';
import { MAX_MESSAGE_LENGTH } from './useBrainwaveAI';

/* ---------------------------- Typing indicator ---------------------------- */

const TypingIndicator = () => (
  <div className="ai-message-in flex justify-start gap-2">
    <div className="mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow">
      <Bot className="h-3.5 w-3.5" />
    </div>
    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs font-medium text-gray-500">
        BrainWave AI is thinking
      </span>
      <span className="flex gap-1">
        <span className="ai-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
        <span className="ai-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
        <span className="ai-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
      </span>
    </div>
  </div>
);

/* ------------------------------ Welcome state ----------------------------- */

const WelcomeState = ({ onQuick, lectureReady }) => (
  <div className="ai-message-in space-y-4">
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-gray-900">
          Hi! I&apos;m BrainWave AI
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          I can help you understand this course and lecture.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Try asking:
          <br />
          &ldquo;Explain this topic simply&rdquo;
          <br />
          &ldquo;Give me an example&rdquo;
          <br />
          &ldquo;What are the important points?&rdquo;
        </p>
      </div>
    </div>
    <AIQuickActions onSelect={onQuick} disabled={!lectureReady} />
    {!lectureReady && (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Select a lecture from the curriculum first so I know what you are
        learning.
      </p>
    )}
  </div>
);

/* --------------------------------- Drawer --------------------------------- */

export const BrainwaveAIDrawer = ({
  isOpen,
  onClose,
  onSend,
  onReset,
  messages,
  isLoading,
  courseTitle,
  currentLectureTitle,
  hasLecture,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Focus the input when the drawer opens.
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Close on Escape.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSend = () => {
    if (!input.trim() || isLoading || !hasLecture) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[90] ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="BrainWave AI learning assistant"
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-gray-50 shadow-2xl transition-transform duration-300 ease-out sm:w-[400px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="rounded-b-2xl bg-gradient-to-br from-orange-500 to-orange-600 px-5 pb-4 pt-4 text-white shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">BrainWave AI</p>
                <p className="text-xs text-orange-100">
                  Your personal learning assistant
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onReset}
                title="Start a new chat"
                aria-label="Start a new chat"
                className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close"
                aria-label="Close assistant"
                className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {courseTitle && (
            <div className="mt-3 rounded-xl bg-white/10 px-3 py-2">
              <p className="truncate text-xs font-medium text-white">
                {courseTitle}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-orange-100">
                {currentLectureTitle
                  ? `Currently learning: ${currentLectureTitle}`
                  : 'Select a lecture to start'}
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
        >
          {messages.length === 0 ? (
            <WelcomeState onQuick={onSend} lectureReady={hasLecture} />
          ) : (
            <>
              {messages.map((message) => (
                <AIMessage key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-3 pb-4">
          <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 transition focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
              }
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading || !hasLecture}
              placeholder={
                hasLecture
                  ? 'Ask about this course...'
                  : 'Select a lecture first'
              }
              aria-label="Ask about this course"
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !hasLecture}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 px-1 text-right text-[10px] text-gray-400">
            {input.length}/{MAX_MESSAGE_LENGTH} · Enter to send · Shift+Enter
            for new line
          </p>
        </div>
      </div>
    </div>
  );
};
