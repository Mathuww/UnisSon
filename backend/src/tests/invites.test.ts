import request from 'supertest';
import app from './appTest.js';
import User from '../models/elem/User.model.js';
import Group from '../models/elem/Group.model.js';
import GroupUser from '../models/link/GroupUser.model.js';
import Invite from '../models/logic/Invite.model.js';
import { AuthService } from '../service/auth.service.js';
import { GroupStatus } from '../shared/GroupStatus.js';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

async function createUser(nickname: string, email: string) {
    const user = await User.create({ nickname, email });
    const token = AuthService.signToken({ sub: user.id.toString() });
    return { user, token };
}

describe('Invite routes', () => {

    describe('POST /api/groups/:id/invite', () => {
        it('creates a new invite token', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await Group.create({ name: 'Test Group', status: GroupStatus.WK_WAITING_SUB });
            await group.addUser(user.id, { through: { weeklyScore: 0, globalScore: 0 } });

            const res = await request(app)
                .post(`/api/groups/${group.id}/invite`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(201);
            expect(res.body.data.token).toBeDefined();

            // Vérification en DB
            const invite = await Invite.findOne({ where: { groupID: group.id, inviterUserID: user.id } });
            expect(invite).not.toBeNull();
            expect(invite?.token).toBe(res.body.data.token);
        });

        it('returns existing token if invite is recent', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await Group.create({ name: 'Test Group', status: GroupStatus.WK_WAITING_SUB });
            await group.addUser(user.id, { through: { weeklyScore: 0, globalScore: 0 } });

            const res1 = await request(app)
                .post(`/api/groups/${group.id}/invite`)
                .set('Authorization', `Bearer ${token}`);

            const res2 = await request(app)
                .post(`/api/groups/${group.id}/invite`)
                .set('Authorization', `Bearer ${token}`);

            expect(res2.status).toBe(200);
            expect(res2.body.data.token).toBe(res1.body.data.token);
        });
    });

    describe('GET /api/invites/:token', () => {
        it('returns invite info', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const { user: user2, token: token2 } = await createUser('user2', 'u2@test.com');
            const group = await Group.create({ name: 'Test Group', status: GroupStatus.WK_WAITING_SUB });
            await group.addUser(user.id, { through: { weeklyScore: 0, globalScore: 0 } });

            const expireDate = new Date();
            expireDate.setHours(expireDate.getHours() + 24);
            const invite = await Invite.create({
                groupID: group.id,
                inviterUserID: user.id,
                token: 'test-token-123',
                expiresAt: expireDate
            });

            const res = await request(app)
                .get(`/api/invites/test-token-123`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.status).toBe(200);
            expect(res.body.data.group.name).toBe('Test Group');
            expect(res.body.data.inviter.nickname).toBe('user1');
            expect(res.body.data.isUserInGroup).toBe(false);
        });

        it('returns 410 if invite is expired', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await Group.create({ name: 'Test Group', status: GroupStatus.WK_WAITING_SUB });
            await group.addUser(user.id, { through: { weeklyScore: 0, globalScore: 0 } });

            const expireDate = new Date('2000-01-01');
            await Invite.create({
                groupID: group.id,
                inviterUserID: user.id,
                token: 'a-long-ago-in-a-token-far-far-away',
                expiresAt: expireDate
            });

            const res = await request(app)
                .get('/api/invites/a-long-ago-in-a-token-far-far-away')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(410);
        });
    });
});