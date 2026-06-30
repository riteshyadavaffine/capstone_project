import { useState } from 'react';

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  busy: boolean;
}

export function MessageComposer({ onSend, busy }: MessageComposerProps) {
  const [content, setContent] = useState('');

  return (
    <form
      className="composer"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!content.trim()) {
          return;
        }

        await onSend(content.trim());
        setContent('');
      }}
    >
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Describe the issue in plain language..."
        rows={4}
        disabled={busy}
      />
      <button className="primary-button" type="submit" disabled={busy || !content.trim()}>
        {busy ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

