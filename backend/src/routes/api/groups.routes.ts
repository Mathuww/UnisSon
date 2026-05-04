import { Router } from "express";
import { GroupController } from "../../controllers/api/groups.js";
import { InviteController } from "../../controllers/api/invite.js";

const router = Router();

// /groups/... 

// POST /groups/ : Créeer un groupe
router.post('/', GroupController.createGroup);

// GET /groups/:id : Infos sur le groupe
router.get('/:id', GroupController.groupUserCheck, GroupController.groupInfo);

// GET /groups/:id/members (liste des membres)
router.get('/:id/members', GroupController.groupUserCheck, GroupController.getUsers);

// DELETE /groups/:id/members/me (quitter un groupe)
router.delete('/:id/members/me', GroupController.groupUserCheck, GroupController.leaveGroup);

// POST /groups/:id/theme (choisir thème cette semaine)
router.post('/:id/theme', GroupController.groupUserCheck, GroupController.setTheme);

// GET /groups/:id/songs (musiques ajoutées cette semaine)
router.get('/:id/songs', GroupController.groupUserCheck, GroupController.getTracks);

// POST /groups/:id/songs (ajtr une musique)
router.post('/:id/songs', GroupController.groupUserCheck, GroupController.addTrack);

// POST /groups/:id/invite (créer un lien d'invitation)
router.post('/:id/invite', GroupController.groupUserCheck, InviteController.invite);

// POST /groups/:id/chosenquiz (soumettre réponses du quiz de l'elu.e)
router.post('/:id/chosenquiz', GroupController.groupUserCheck, GroupController.submitChosenQuizAnswers);

// POST /groups/:id/chosenrank (soumettre classement de l'élu.e)
router.post('/:id/chosenrank', GroupController.groupUserCheck, GroupController.submitChosenRanking);

// POST /groups/:id/predrank (soumettre classement de prédiction)
router.post('/:id/predrank', GroupController.groupUserCheck, GroupController.submitPredRanking);

export default router;