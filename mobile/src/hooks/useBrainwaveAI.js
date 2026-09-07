// ---------------------------------------------------------------------------
// useBrainwaveAI.js
// Owns the chat UI state (messages, loading, drawer open/close) for the
// BrainWave AI Learning Assistant. Sends messages to the EXISTING backend
// endpoint (POST /api/ai/chat) through the shared, authenticated API service.
// Conversation history is kept in memory only (V1 — no persistence).
// ---------------------------------------------------------------------------

import { useCallback, useRef, useState } from 'react';
import { aiChat, aiFriendlyError } from '../services/api';

// Maximum character length allowed on both client and server.
export const MAX_MESSAGE_LENGTH = 2000;

// Only send the latest N messages to keep token usage reasonable.
const HISTORY_TO_SEND = 10;

export function useBrainwaveAI({ courseId, lectureId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesRef = useRef([]);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const resetChat = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (rawText) => {
      const text = (rawText || '').trim();
      if (!text || text.length > MAX_MESSAGE_LENGTH) return;
      if (isLoading) return;
      if (!courseId || !lectureId) return;

      const userMsg = { id: nextId(), role: 'user', content: text, isError: false };
      const afterUser = [...messagesRef.current, userMsg];
      messagesRef.current = afterUser;
      setMessages(afterUser);
      setIsLoading(true);

      // History excludes the just-sent message; keep only recent turns.
      const history = afterUser
        .slice(0, -1)
        .slice(-HISTORY_TO_SEND)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const reply = await aiChat({ courseId, lectureId, message: text, conversation: history });
        const replyMsg = { id: nextId(), role: 'assistant', content: reply, isError: false };
        const withReply = [...messagesRef.current, replyMsg];
        messagesRef.current = withReply;
        setMessages(withReply);
      } catch (error) {
        const friendly = aiFriendlyError(error);
        const errMsg = { id: nextId(), role: 'assistant', content: friendly, isError: true };
        const withErr = [...messagesRef.current, errMsg];
        messagesRef.current = withErr;
        setMessages(withErr);
      } finally {
        setIsLoading(false);
      }
    },
    [courseId, lectureId, isLoading]
  );

  return { isOpen, open, close, messages, sendMessage, isLoading, resetChat };
}