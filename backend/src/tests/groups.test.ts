import request from 'supertest';
import app from './appTest.js';
import User from '../models/elem/User.model.js';
import Group from '../models/elem/Group.model.js';
import GroupUser from '../models/link/GroupUser.model.js';
import GroupPeriod from '../models/logic/GroupPeriod.model.js';
import GroupPlaylist from '../models/link/GroupPlaylist.model.js';
import Track from '../models/elem/Track.model.js';
import { AuthService } from '../service/auth.service.js';
import { GroupStatus } from '../shared/GroupStatus.js';
import { TimeManager } from "../shared/TimeManager.js";
import { PeriodType } from "../shared/PeriodType.js";
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

async function createUser(nickname: string, email: string) {
    const user = await User.create({ nickname, email });
    const token = AuthService.signToken({ sub: user.id.toString() });
    return { user, token };
}

async function createGroup(user: User, status = GroupStatus.WK_WAITING_SUB) {
    const group = await Group.create({ name: 'Test Group', maxUsers: 4, status });
    await group.addUser(user.id, {
        through: { notifPending: false, weeklyScore: 0, globalScore: 0 }
    });
    return group;
}

describe('Group routes', () => {
    describe('GET /api/groups/:id', () => {
        it('returns 200 with group info', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user);

            const res = await request(app)
                .get(`/api/groups/${group.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Test Group');
        });

        it('returns 200 with users if includeUsers=true', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user);

            const res = await request(app)
                .get(`/api/groups/${group.id}?includeUsers=true`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.users).toHaveLength(1);
            expect(res.body.data.users[0].nickname).toBe('user1');
        });

        it('returns 403 if user not in group', async () => {
            const { user: user1 } = await createUser('user1', 'u1@test.com');
            const { token: token2 } = await createUser('user2', 'u2@test.com');
            const group = await createGroup(user1);

            const res = await request(app)
                .get(`/api/groups/${group.id}`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.status).toBe(403);
        });

        it('returns 404 if group does not exist', async () => {
            const { token } = await createUser('user1', 'u1@test.com');

            const res = await request(app)
                .get('/api/groups/99999')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/groups/:id/theme', () => {
        it('returns 200 and updates theme if user is chosen one', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user, GroupStatus.SUN_WAITING_THEME);
            await group.update({ chosenOneUserID: user.id });

            const res = await request(app)
                .post(`/api/groups/${group.id}/theme`)
                .set('Authorization', `Bearer ${token}`)
                .send({ theme: 'Jazzy soul with hardcore rap' });
            console.log(res.body);
            expect(res.status).toBe(200);

            const updatedGroup = await Group.findByPk(group.id);
            expect(updatedGroup?.theme).toBe('Jazzy soul with hardcore rap');
            expect(updatedGroup?.status).toBe(GroupStatus.SUN_DONE_THEME);
        });

        it('returns 403 if user is not chosen one', async () => {
            const { user: user1 } = await createUser('user1', 'u1@test.com');
            const { user: user2, token: token2 } = await createUser('user2', 'u2@test.com');
            const group = await createGroup(user1, GroupStatus.SUN_WAITING_THEME);
            await group.addUser(user2.id, { through: { weeklyScore: 0, globalScore: 0 } });
            await group.update({ chosenOneUserID: user1.id });

            const res = await request(app)
                .post(`/api/groups/${group.id}/theme`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ theme: 'Summer vibes' });

            expect(res.status).toBe(403);
        });

        it('returns 403 if wrong status', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user, GroupStatus.WK_WAITING_SUB);
            await group.update({ chosenOneUserID: user.id });

            const res = await request(app)
                .post(`/api/groups/${group.id}/theme`)
                .set('Authorization', `Bearer ${token}`)
                .send({ theme: 'My girlfriend left me' });

            expect(res.status).toBe(403);
        });
    });

    describe('POST /api/groups/:id/songs', () => {
        it('returns 201 if not chosen one, in the right period and track not already existing', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const { user: chosenUser } = await createUser('notchosen', 'notchosen@test.com');
            const group = await createGroup(user, GroupStatus.WK_WAITING_SUB);
            await group.addUser(chosenUser.id, { through: { weeklyScore: 0, globalScore: 0 } });
            await group.update({ chosenOneUserID: chosenUser.id });

            await GroupPeriod.create({
                groupID: group.id,
                periodType: PeriodType.WK_PERIOD,
                periodStart: TimeManager.now()
            });

            const res = await request(app)
                .post(`/api/groups/${group.id}/songs`)
                .set('Authorization', `Bearer ${token}`)
                .send({youtubeLink: "azgfgfgd"});

            expect(res.status).toBe(201);
            expect(res.body.data.youtubeLink).toBe("azgfgfgd");
        });
        
        it('returns 400 if youtubeLink is missing', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const { user: chosenUser } = await createUser('chosen', 'chosen@test.com');
            const group = await createGroup(user, GroupStatus.WK_WAITING_SUB);
            await group.addUser(chosenUser.id, { through: { weeklyScore: 0, globalScore: 0 } });
            await group.update({ chosenOneUserID: chosenUser.id });

            const res = await request(app)
                .post(`/api/groups/${group.id}/songs`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('returns 403 if wrong status', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user, GroupStatus.SUN_WAITING_THEME);

            const res = await request(app)
                .post(`/api/groups/${group.id}/songs`)
                .set('Authorization', `Bearer ${token}`)
                .send({ youtubeLink: 'abc123' });

            expect(res.status).toBe(403);
        });

        it('returns 403 if user is chosen one', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user, GroupStatus.WK_WAITING_SUB);
            await group.update({ chosenOneUserID: user.id });

            const res = await request(app)
                .post(`/api/groups/${group.id}/songs`)
                .set('Authorization', `Bearer ${token}`)
                .send({ youtubeLink: 'abc123' });

            expect(res.status).toBe(403);
        });
        
    });
    
    describe('GET /api/groups/:id/songs', () => {
        it('returns tracks added since last cycle', async () => {
            const { user, token } = await createUser('user1', 'u1@test.com');
            const group = await createGroup(user);
            await group.update({ lastCycleChange: new Date('2000-01-01') });

            const track = await Track.create({ title: 'Test Track', youtubeLink: 'abc123' });
            await GroupPlaylist.create({ groupID: group.id, userID: user.id, trackID: track.id });

            const res = await request(app)
                .get(`/api/groups/${group.id}/songs`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].track.title).toBe('Test Track');
        });
    });
});