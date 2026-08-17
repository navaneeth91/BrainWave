// ---------------------------------------------------------------------------
// AIMessage.jsx
// Renders one chat bubble (user or assistant) and a safe, React-only markdown
// renderer for AI responses. No dangerouslySetInnerHTML is used anywhere, so
// model output can never inject HTML.
// ---------------------------------------------------------------------------

import React, { Fragment } from 'react';
import { Bot, User } from 'lucide-react';

/* ------------------------- Safe inline renderer -------------------------- */

const InlineMarkdown = ({ text }) => {
  const nodes = [];
  const regex =
    /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(_[^_\n]+_)|(\*[^*\n]+\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let match = null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const [, code, bold, italicUnderscore, italicAsterisk, linkText, linkUrl] =
      match;
    if (code) {
      nodes.push(
        <code key={key++} className="ai-code">
          {code.slice(1, -1)}
        </code>
      );
    } else if (bold) {
      nodes.push(<strong key={key++}>{bold.slice(2, -2)}</strong>);
    } else if (italicUnderscore) {
      nodes.push(<em key={key++}>{italicUnderscore.slice(1, -1)}</em>);
    } else if (italicAsterisk) {
      nodes.push(<em key={key++}>{italicAsterisk.slice(1, -1)}</em>);
    } else if (linkUrl) {
      nodes.push(
        <a
          key={key++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ai-link"
        >
          {linkText}
        </a>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return <>{nodes}</>;
};

/* ------------------------- Safe block renderer --------------------------- */

const renderBlocks = (content) => {
  const lines = content.split('\n');
  const blocks = [];
  let i = 0;
  let key = 0;

  const push = (node) =>
    blocks.push(<Fragment key={key++}>{node}</Fragment>);

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code fence
    if (/^```/.test(trimmed)) {
      const buf = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      push(
        <pre className="ai-code-block">
          <code>{buf.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (trimmed === '') {
      i += 1;
      continue;
    }

    // Headings (#, ##, ###)
    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
      push(
        <Tag className="ai-heading">
          <InlineMarkdown text={heading[2]} />
        </Tag>
      );
      i += 1;
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(
          <li key={items.length}>
            <InlineMarkdown
              text={lines[i].trim().replace(/^[-*•]\s+/, '')}
            />
          </li>
        );
        i += 1;
      }
      push(<ul className="ai-list">{items}</ul>);
      continue;
    }
    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(
          <li key={items.length}>
            <InlineMarkdown
              text={lines[i].trim().replace(/^\s*\d+[.)]\s+/, '')}
            />
          </li>
        );
        i += 1;
      }
      push(<ol className="ai-list">{items}</ol>);
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      push(
        <blockquote className="ai-quote">
          <InlineMarkdown text={buf.join(' ')} />
        </blockquote>
      );
      continue;
    }

    // Paragraph (gather until blank or another block marker)
    const para = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3}\s|```|[-*•]\s|\d+[.)]\s|>\s?)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    push(
      <p className="ai-paragraph">
        <InlineMarkdown text={para.join(' ')} />
      </p>
    );
  }

  return blocks;
};

/* ------------------------------ Message bubble --------------------------- */

export const AIMessage = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="ai-message-in flex justify-end gap-2">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-orange-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          {message.content}
        </div>
        <div className="mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
          <User className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="ai-message-in flex justify-start gap-2">
      <div className="mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div
        className={`max-w-[85%] break-words rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          message.isError
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-gray-200 bg-white text-gray-800'
        }`}
      >
        {renderBlocks(message.content)}
      </div>
    </div>
  );
};
