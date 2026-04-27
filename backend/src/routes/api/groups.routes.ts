import { Router } from "express";
import { GroupController } from "../../controllers/api/groups.js";
import { InviteController } from "../../controllers/api/invite.js";

const router = Router();

// /groups/... 

// /groups/
router.post('/', GroupController.createGroup);
router.get('/:id', GroupController.groupUserCheck, GroupController.groupInfo);

// GET /groups/:id/members (liste des membres)
router.get('/:id/members', GroupController.groupUserCheck, GroupController.getUsers);

// POST /groups/:id/members/me (ajt un membre)
router.post('/:id/members/me', GroupController.addUser);

// DELETE /groups/:id/members/me (quitter un groupe)
router.delete('/:id/members/me', GroupController.groupUserCheck, GroupController.leaveGroup);

// POST /groups/:id/theme (choisir thème cette semaine)
// Required state : SUN_WAITING_THEME
router.post('/:id/theme', GroupController.groupUserCheck, GroupController.setTheme);

// GET /groups/:id/songs (musiques ajoutées cette semaine)
router.get('/:id/songs', GroupController.groupUserCheck, GroupController.getTracks);

// POST /groups/:id/songs (ajtr une musique)
// Required group state : WK_WAITING_SUB
router.post('/:id/songs', GroupController.groupUserCheck, GroupController.addTrack);

// POST /groups/:id/invite (créer un lien d'invitation)
router.post('/:id/invite', GroupController.groupUserCheck, InviteController.invite);

export default router;