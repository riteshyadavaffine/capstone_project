import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { MessageComposer } from '../components/MessageComposer';
import { useAuth } from '../hooks/useAuth';
import { createConversation, escalateConversation, fetchConversations, sendMessage } from '../services/api';
import type { Conversation } from '../types';

export function CustomerDashboard() {
  const { auth, signOut } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      if (!auth) {
        return;
      }
      setLoadingList(true);
      setError(null);
      try {
        const result = await fetchConversations(auth.token);
        setItems(result.items);
        setSelectedId((current) => current ?? result.items[0]?.id ?? null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'We could not load your conversations.');
      } finally {
        setLoadingList(false);
      }
    }

    load();
  }, [auth]);

  const selectedConversation = useMemo(
    () => items.find((conversation) => conversation.id === selectedId) ?? null,
    [items, selectedId],
  );

  if (!auth) {
    return null;
  }

  async function refreshSelected(nextSelectedId?: string) {
    if (!auth) return;
    const result = await fetchConversations(auth.token);
    setItems(result.items);
    setSelectedId(nextSelectedId ?? selectedId ?? result.items[0]?.id ?? null);
  }

  return (
    <AppShell
      title={`Welcome back, ${auth.user.name}`}
      subtitle="Create a support conversation, get an AI-assisted response, and escalate to a human when needed."
      actions={<button onClick={signOut}>Sign out</button>}
    >
      <ErrorBanner message={error} />
      {loadingList ? (
        <LoadingState label="Loading your conversations…" />
      ) : (
        <div className="dashboard-grid responsive-grid">
          <section className="card sidebar-card">
            <h2>Your conversations</h2>
            <form
              className="inline-form"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!subject.trim()) {
                  return;
                }
                setSaving(true);
                setError(null);
                try {
                  const result = await createConversation(auth.token, subject.trim());
                  setSubject('');
                  await refreshSelected(result.conversation.id);
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : 'We could not create your conversation.');
                } finally {
                  setSaving(false);
                }
              }}
            >
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="New subject"
                aria-label="New subject"
              />
              <button className="primary-button" disabled={saving || !subject.trim()}>
                {saving ? 'Creating…' : 'Create'}
              </button>
            </form>
            <div className="conversation-list">
              {items.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`conversation-item ${selectedId === conversation.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <strong>{conversation.subject}</strong>
                  <span>{conversation.status}</span>
                </button>
              ))}
              {!items.length && <p>No conversations yet. Start by creating one.</p>}
            </div>
          </section>
          <section className="card detail-card">
            {selectedConversation ? (
              <>
                <div className="conversation-header">
                  <div>
                    <h2>{selectedConversation.subject}</h2>
                    <p>Status: {selectedConversation.status}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      setError(null);
                      try {
                        await escalateConversation(auth.token, selectedConversation.id);
                        await refreshSelected(selectedConversation.id);
                      } catch (caught) {
                        setError(caught instanceof Error ? caught.message : 'We could not escalate this conversation.');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving || selectedConversation.escalated}
                  >
                    {selectedConversation.escalated ? 'Escalated' : 'Escalate to human'}
                  </button>
                </div>
                <div className="message-thread">
                  {selectedConversation.messages.map((message) => (
                    <article key={message.id} className={`message-bubble ${message.role}`}>
                      <span className="message-role">{message.role}</span>
                      <p>{message.content}</p>
                    </article>
                  ))}
                </div>
                <MessageComposer
                  busy={sending}
                  onSend={async (content) => {
                    setSending(true);
                    setError(null);
                    try {
                      await sendMessage(auth.token, selectedConversation.id, content);
                      await refreshSelected(selectedConversation.id);
                    } catch (caught) {
                      setError(caught instanceof Error ? caught.message : 'We could not send your message.');
                    } finally {
                      setSending(false);
                    }
                  }}
                />
              </>
            ) : (
              <LoadingState label="Select or create a conversation to begin." />
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}

