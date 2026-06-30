import Anthropic from '@anthropic-ai/sdk';import { env } from '../env.js';
import type { Conversation, Settings } from '../types.js';

const client = env.anthropicApiKey ? new Anthropic({ apiKey: env.anthropicApiKey }) : null;

function fallbackReply(conversation: Conversation, settings: Settings, latestMessage: string) {
  const lower = latestMessage.toLowerCase();
  const opener = 'Thanks for reaching out. Here are the best next steps based on what you shared:';

  if (lower.includes('password')) {
    return `${opener}\n1. Check your spam or junk folder.\n2. Make sure you are using the correct account email.\n3. Wait two minutes, then request another reset email.\nIf that still does not work, I can escalate this to the support team at ${settings.supportEmail}.`;
  }

  if (lower.includes('refund') || lower.includes('cancel')) {
    return `I can help with that. For billing requests, please include your order number and the email linked to the purchase. I am also flagging this conversation for a human review so the team at ${settings.supportEmail} can follow up.`;
  }

  if (lower.includes('error') || lower.includes('bug')) {
    return `${opener}\n1. Refresh the page and try again.\n2. Note the exact time the issue happened.\n3. Tell me what you clicked right before the problem started.\nOnce you share that, I can guide you further or escalate it.`;
  }

  return `${settings.systemPrompt}\n\nBased on your message, the fastest path is to gather the key details, confirm the expected outcome, and provide one clear next action. If you would like a specialist to step in, say “human support” and I will escalate the conversation.`;
}

/**
 * Generates a support reply using the Anthropic Claude API.
 * Falls back to a deterministic keyword-matched reply when ANTHROPIC_API_KEY is absent,
 * so the application is fully functional without a paid API key.
 *
 * Prompt strategy: include only the last 8 messages to avoid context window overflow
 * and to keep token costs low during demos.
 */
export async function generateAssistantReply(conversation: Conversation, settings: Settings, latestMessage: string) {
  if (!client) {
    return fallbackReply(conversation, settings, latestMessage);
  }

  const transcript = conversation.messages
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n');

  const completion = await client.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 300,
    system: settings.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Conversation so far:\n${transcript}\n\nLatest user message:\n${latestMessage}\n\nReply with concise, actionable support guidance and avoid technical jargon.`,
      },
    ],
  });

  const firstBlock = completion.content.find((block) => block.type === 'text');
  return firstBlock?.text ?? fallbackReply(conversation, settings, latestMessage);
}

