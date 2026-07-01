import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { resetDb } from '../src/db.js';

const app = createApp();

async function loginAs(email: string, password: string) {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.token as string;
}

describe('api integration', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('logs in via the auth endpoint', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'customer@supportpilot.dev',
      password: 'Password123!',
    });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe('customer');
  });

  it('returns healthy status from the health endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('creates a conversation and appends a reply', async () => {
    const token = await loginAs('customer@supportpilot.dev', 'Password123!');

    const createResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Need help with account access' });

    expect(createResponse.status).toBe(201);

    const messageResponse = await request(app)
      .post(`/api/conversations/${createResponse.body.conversation.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'I found an error when I try to sign in.' });

    expect(messageResponse.status).toBe(200);
    expect(messageResponse.body.conversation.messages.length).toBe(2);
  });

  it('updates admin settings from the admin endpoint', async () => {
    const token = await loginAs('admin@supportpilot.dev', 'AdminPass123!');

    const response = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        systemPrompt: 'You are a careful assistant that offers calm, practical support for internal teams.',
        escalationKeywords: ['urgent', 'human'],
        supportEmail: 'updated@supportpilot.dev',
      });

    expect(response.status).toBe(200);
    expect(response.body.settings.supportEmail).toBe('updated@supportpilot.dev');
  });

  it('rejects unauthenticated requests with a plain-language message', async () => {
    const response = await request(app).get('/api/conversations');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('sign in');
  });

  it('returns a plain-language message for validation errors', async () => {
    const token = await loginAs('customer@supportpilot.dev', 'Password123!');
    const response = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'x' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('incomplete or invalid');
  });

  it('blocks a customer from accessing admin settings', async () => {
    const token = await loginAs('customer@supportpilot.dev', 'Password123!');
    const response = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('access');
  });

  it('auto-escalates a conversation when an escalation keyword is sent', async () => {
    const token = await loginAs('customer@supportpilot.dev', 'Password123!');

    const createResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Billing issue' });

    const messageResponse = await request(app)
      .post(`/api/conversations/${createResponse.body.conversation.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'I need a refund immediately.' });

    expect(messageResponse.body.conversation.escalated).toBe(true);
    expect(messageResponse.body.conversation.status).toBe('escalated');
  });
});

