// ---------------------------------------------------------------------------
// BrainwaveAIFloatingAssistant.jsx
// Mounted on the Student Player page. Combines the floating button, the
// slide-in drawer and the chat hook into a single self-contained feature so
// it does not disturb the existing layout.
// ---------------------------------------------------------------------------

import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useBrainwaveAI } from './useBrainwaveAI';
import { BrainwaveAIButton } from './BrainwaveAIButton';
import { BrainwaveAIDrawer } from './BrainwaveAIDrawer';

export const BrainwaveAIFloatingAssistant = ({
  courseData,
  currentLecture,
}) => {
  const { backendUrl, getToken } = useContext(AppContext);

  const courseId = courseData?._id;
  const lectureId = currentLecture?.lectureId;
  const hasLecture = Boolean(lectureId);

  const { isOpen, open, close, messages, sendMessage, isLoading, resetChat } =
    useBrainwaveAI({ backendUrl, getToken, courseId, lectureId });

  if (!courseId) return null;

  return (
    <>
      <BrainwaveAIButton onClick={open} />
      <BrainwaveAIDrawer
        isOpen={isOpen}
        onClose={close}
        onSend={sendMessage}
        onReset={resetChat}
        messages={messages}
        isLoading={isLoading}
        courseTitle={courseData.courseTitle}
        currentLectureTitle={currentLecture?.lectureTitle}
        hasLecture={hasLecture}
      />
    </>
  );
};

export default BrainwaveAIFloatingAssistant;