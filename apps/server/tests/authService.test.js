import { beforeEach, describe, expect, it } from 'vitest';
import { login } from '../src/services/authService.js';
import { resetDb } from '../src/db.js';
describe('authService', () => {
    beforeEach(async () => {
        await resetDb();
    });
    it('logs in a seeded customer', async () => {
        const result = await login('customer@supportpilot.dev', 'Password123!');
        expect(result.user.email).toBe('customer@supportpilot.dev');
        expect(result.token).toBeTruthy();
    });
    it('rejects invalid credentials', async () => {
        await expect(login('customer@supportpilot.dev', 'wrong-password')).rejects.toThrow('We could not find an account with those details. Please check your email and password.');
    });
});
