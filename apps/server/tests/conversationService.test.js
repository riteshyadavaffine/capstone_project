import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../src/db.js';
import { addMessage, createConversation, listConversations } from '../src/services/conversationService.js';
const customer = {
    id: 'user-demo',
    email: 'customer@supportpilot.dev',
    name: 'Demo Customer',
    role: 'customer',
};
describe('conversationService', () => {
    beforeEach(async () => {
        await resetDb();
    });
    it('creates a new conversation for the signed-in user', () => {
        const conversation = createConversation(customer, 'Billing question');
        expect(conversation.subject).toBe('Billing question');
        expect(listConversations(customer)[0].id).toBe(conversation.id);
    });
    it('adds assistant output and escalates when keywords are present', async () => {
        const conversation = createConversation(customer, 'Refund request');
        const updated = await addMessage(customer, conversation.id, 'I need a refund and human support.');
        expect(updated.messages.length).toBe(2);
        expect(updated.escalated).toBe(true);
        expect(updated.status).toBe('escalated');
    });
});
