import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAdminSettings,
  fetchEscalatedConversations,
  updateAdminSettings,
  updateConversationStatus,
} from '../services/api';
import type { Conversation, Settings } from '../types';

const emptySettings: Settings = {
  systemPrompt: '',
  escalationKeywords: [],
  supportEmail: '',
};

export function AdminDashboard() {
  const { auth, signOut } = useAuth();
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [escalatedItems, setEscalatedItems] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!auth) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [settingsResult, escalatedResult] = await Promise.all([
          fetchAdminSettings(auth.token),
          fetchEscalatedConversations(auth.token),
        ]);
        setSettings(settingsResult.settings);
        setEscalatedItems(escalatedResult.items);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'We could not load the admin workspace.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [auth]);

  if (!auth) {
    return null;
  }

  async function reloadEscalations() {
    if (!auth) return;
    const result = await fetchEscalatedConversations(auth.token);
    setEscalatedItems(result.items);
  }

  return (
    <AppShell
      title="Support admin console"
      subtitle="Tune the assistant prompt, manage escalation keywords, and review conversations that need human follow-up."
      actions={<button onClick={signOut}>Sign out</button>}
    >
      <ErrorBanner message={error} />
      {success ? <div className="success-banner">{success}</div> : null}
      {loading ? (
        <LoadingState label="Loading the admin workspace…" />
      ) : (
        <div className="dashboard-grid responsive-grid">
          <section className="card detail-card">
            <h2>Assistant settings</h2>
            <form
              className="settings-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setSaving(true);
                setError(null);
                setSuccess(null);
                try {
                  const result = await updateAdminSettings(auth.token, settings);
                  setSettings(result.settings);
                  setSuccess(result.message);
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : 'We could not save the settings right now.');
                } finally {
                  setSaving(false);
                }
              }}
            >
              <label>
                System prompt
                <textarea
                  rows={6}
                  value={settings.systemPrompt}
                  onChange={(event) => setSettings({ ...settings, systemPrompt: event.target.value })}
                />
              </label>
              <label>
                Escalation keywords
                <input
                  value={settings.escalationKeywords.join(', ')}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      escalationKeywords: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label>
                Support email
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })}
                />
              </label>
              <button className="primary-button" disabled={saving}>
                {saving ? 'Saving…' : 'Save settings'}
              </button>
            </form>
          </section>
          <section className="card sidebar-card">
            <h2>Escalated conversations</h2>
            <div className="conversation-list">
              {escalatedItems.map((conversation) => (
                <article key={conversation.id} className="escalation-card">
                  <strong>{conversation.subject}</strong>
                  <p>{conversation.messages[conversation.messages.length - 1]?.content}</p>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      setError(null);
                      try {
                        await updateConversationStatus(auth.token, conversation.id, 'resolved');
                        await reloadEscalations();
                      } catch (caught) {
                        setError(caught instanceof Error ? caught.message : 'We could not resolve that conversation.');
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Mark resolved
                  </button>
                </article>
              ))}
              {!escalatedItems.length && <p>No escalated conversations right now.</p>}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

