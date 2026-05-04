import request from 'supertest';
import app from './appTest.js';
import User from '../models/elem/User.model.js';
import { AuthService } from '../service/auth.service.js';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Authentication routes', () => {

    describe('POST /api/auth/checktoken', () => {
        it('returns 200 with user if token is valid', async () => {
            const user = await User.create({ nickname: 'testuser', email: 'test@test.com' });
            const token = AuthService.signToken({ sub: user.id.toString() });

            const res = await request(app)
                .post('/api/auth/checktoken')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.nickname).toBe('testuser');
        });

        it('returns 401 if no token', async () => {
            const res = await request(app)
                .post('/api/auth/checktoken');

            expect(res.status).toBe(401);
        });

        it('returns 403 if token is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/checktoken')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.status).toBe(403);
        });
    });
});