import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../src/db.js';
import { getSettings, updateSettings } from '../src/services/adminService.js';
const admin = {
    id: 'admin-demo',
    email: 'admin@supportpilot.dev',
    name: 'Support Admin',
    role: 'admin',
};
describe('adminService', () => {
    beforeEach(async () => {
        await resetDb();
    });
    it('returns admin settings', () => {
        const settings = getSettings(admin);
        expect(settings.supportEmail).toContain('@');
    });
    it('updates admin settings', async () => {
        const settings = await updateSettings(admin, {
            systemPrompt: 'You are a calm assistant that provides short, actionable guidance for customers.',
            escalationKeywords: ['refund'],
            supportEmail: 'hello@supportpilot.dev',
        });
        expect(settings.supportEmail).toBe('hello@supportpilot.dev');
    });
});
