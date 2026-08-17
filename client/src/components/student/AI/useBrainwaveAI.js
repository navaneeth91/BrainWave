// ---------------------------------------------------------------------------
// useBrainwaveAI.js
// Owns the chat UI state (messages, loading, drawer open/close) and the
// network call to the BrainWave backend AI endpoint. Conversation history is
// intentionally kept in React state only (V1 — no persistence).
// ---------------------------------------------------------------------------

import { useCallback, useRef, useState } from 'react';
import axios from 'axios';

// Maximum character length allowed on both client and server.
export const MAX_MESSAGE_LENGTH = 2000;

// Only send the latest N messages to keep token usage reasonable.
const HISTORY_TO_SEND = 10;

const friendlyError = (error) => {
  const status = error?.response?.status;
  if (status === 401) {
    return 'Please sign in to use BrainWave AI.';
  }
  if (status === 403) {
    return 'You must be enrolled in this course to use BrainWave AI.';
  }
  if (status === 404) {
    return 'The course or lecture could not be found. Please refresh and try again.';
  }
  if (status === 429) {
    return "You're asking BrainWave AI a lot right now. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "Sorry, BrainWave AI couldn't respond right now. Please try again.";
  }
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return 'BrainWave AI is taking a little too long to respond. Please try again.';
  }
  if (error?.message === 'Network Error') {
    return 'A network error occurred. Please check your connection and try again.';
  }

  return "Sorry, BrainWave AI couldn't respond right now. Please try again.";
};

/**
 * @param {{ backendUrl: string, getToken: () => Promise<string|null>,
 *           courseId?: string, lectureId?: string }} params
 */
export const useBrainwaveAI = ({
  backendUrl,
  getToken,
  courseId,
  lectureId,
}) => {
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

      const userMsg = {
        id: nextId(),
        role: 'user',
        content: text,
        isError: false,
      };
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
        const token = await getToken();
        const { data } = await axios.post(
          `${backendUrl}/api/ai/chat`,
          {
            courseId,
            lectureId,
            message: text,
            conversation: history,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 60000,
          }
        );

        if (data && data.success) {
          const reply = {
            id: nextId(),
            role: 'assistant',
            content: data.reply,
            isError: false,
          };
          const withReply = [...messagesRef.current, reply];
          messagesRef.current = withReply;
          setMessages(withReply);
        } else {
          throw new Error(data?.message || 'Request failed');
        }
      } catch (error) {
        const friendly = friendlyError(error);
        const errMsg = {
          id: nextId(),
          role: 'assistant',
          content: friendly,
          isError: true,
        };
        const withErr = [...messagesRef.current, errMsg];
        messagesRef.current = withErr;
        setMessages(withErr);
      } finally {
        setIsLoading(false);
      }
    },
    [backendUrl, getToken, courseId, lectureId, isLoading]
  );

  return {
    isOpen,
    open,
    close,
    messages,
    sendMessage,
    isLoading,
    resetChat,
  };
};