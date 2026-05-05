# Documentation de l'API backend d'UnisSon
Gaïa D.

# Types de retour
Selon le cas :
## Succès
- 200 OK : la requête a fonctionné, on renvoie des données
- 201 Resource created : la requête a fonctionné, on renvoie des données, le 201 est juste là pour dire que la requête a entraîné la création d'une ressource côté serveur (pour rester dans les normes REST).
- 204 No Content : la requête a fonctionné mais il n'y a rien à envoyer.

En cas de succès, l'API renvoie un objet `{data: [les données]}`.
Ces données peuvent une ressource élementaire de la BDD (User, Group, Track), un tableau de ressources élementaire s(genre User[]) ou un objet spécifique.

### User (exemple)

```json
{
  "id": 42,
  "nickname": "musicLover",
  "email": "user@example.com",
  "profileDescription": "I hate discovering new tracks",
  "profilePicture": "base64-encoded-image-or-null"
}
```

### Group (exemple)

```json
{
  "id": 1,
  "name": "Road Trip Playlist",
  "maxUsers": 10,
  "notifNB": 2,
  "groupPicture": "base64-encoded-image-or-null",
  "chosenOneUserID": 42,
  "status": "WK_WAITING_SUB" [un statut parmi GroupStatus],
  "lastCycleChange": "2026-04-10T12:00:00.000Z",
  "theme": "Summer vibes"
}
```

```typescript
GroupStatus {
    "SUN_WAITING_THEME",
    "SUN_DONE_THEME",
    "WK_WAITING_SUB",
    "WK_DONE_SUB",
    "SAT_WAITING_QUIZ",
    "SAT_DONE_QUIZ"
}
```

### Track (exemple)
```json
{
  "id": 99,
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "youtubeLink": "https://www.youtube.com/watch?v=4NRXx6U8ABQ"
}
```

## Erreurs
- 400 Bad Request : il manque quelque chose dans le corps de la requête
- 401 Unauthorized : la ressource est sécurisée mais il manque les données d'authentification dans la requête (JWT)
- 403 Forbidden : l'authentification n'a pas fonctionné (soit le JWT a expiré, est invalide...) ou alors l'utilisateur n'est pas autorisé à faire cette requête (user en dehors du group, etc.)
- 404 Not Found : la requête a entraîné la recherche d'une ressource inexistante.
- 409 Conflict : la requête a tente la création d'une ressource censée être unique, mais qui existait déjà.
- 500 Internal Server Error : erreur interne (souvent avec la DB).

S'il y a une erreur l'API renvoie :
```json
{
    "error": {
        "message": [le message]
    }
}
```

## Données `meta`
Toutes les routes sans exception renvoie non seulement l'objet data qui comprend les données demandées, mais également un objet meta :
```json
meta: {
  timestamp: (temps réel en ISO string),
  simulationTime: (temps fictif en ISO string),
  path: (chemin accédé initialement)
}
```

## /api/auth : Routes d'authentification
### /auth/google (POST)
Fonction : S'inscrire/se connecter avec un token Google.

Corps : 
- idToken
- authCode 

Renvoie : 
```json
data: {
  token: (JWT utilisé dans l'application),
  user: User
}
```

## /api/users/ : Routes concernant l'utilisateur
**Routes sécurisées.**

**Chaque requête doit comporter le header `Authorization` qui contient "Bearer [le JWT]".**

### /api/users/me (GET)
Fonction : Renvoie les données de l'utilisateur.

Renvoie :
- data : User

### /api/users/me/groups (GET)
Fonction : Liste les groupes auxquels appartient l'utilisateur.

Renvoie :
- data : Group[]

## /api/groups/ : Routes concernant les groupes
**Routes sécurisées.**
**Chaque requête doit comporter le header `Authorization` qui contient "Bearer [le JWT]".**

**Remplacer `:id` dans l'URL par l'ID du groupe concerné.**
**Mis à part la route de création d'un groupe, toutes les autres requièrent que l'utilisateur qui fait la requête fasse partie du groupe ':id'.**

### /api/groups/:id (GET)
Fonction : Infos sur un groupe.

Renvoie :
```json
data: {
  id,
  name,
  status : GroupStatus,
  chosenOne: User || null,
  theme,
  maxUsers,
  weeklyScore,
  globalScore,
  canUserAdd : possibilité d'ajouter une musique,
  quizDone : quiz effectué,
  rankDone : classement effectué,
  users: User[]
}
```

### /api/groups/ (POST)
Fonction : Créer un groupe.

Corps : 
- name : Nom du groupe.
- maxUsers : Nombre maximal de membres.

Renvoie :
- data : Group

### /api/groups/:id/members (GET)
Fonction : Liste les membres de ce groupe.

Renvoie :
- data : User[]

### /api/groups/:id/members/me (DELETE)
Fonction : Quitte ce groupe.

Ne renvoie pas de données (204 No Content).

### /api/groups/:id/theme (POST)
Fonction : Ajouter le thème de la semaine.
**Uniquement accessible par l'élu.e**
Requiert que le groupe soit en `SUN_WAITING_THEME`.

Renvoie :
 - data : Group

### /api/groups/:id/songs (GET)
Fonction : Renvoie les musiques ajoutées cette semaine.

Renvoie :
```json
data : {track: Track, addedBy: User}[]
```

### /api/groups/:id/songs (POST)
Fonction : Ajoute une musique à la sélection de la semaine.
Requiert que le groupe soit en `WK_WAITING_SUB`.

Corps :
- youtubeLink : ID du morceau sur YouTube.

Renvoie :
- data : Track

Types d'erreur :
- 403 : Le groupe n'est pas en état d'accepter un morceau, ou l'utilisateur ne peut pas ajouté un morceau.
- 404 : Le video ID référence une vidéo qui n'existe pas.
- 409 : Le morceau a déjà été ajouté dans ce groupe.

### /api/groups/:id/invite (POST)
Fonction : Crée un token d'invitation pour ce groupe

Corps : aucun.

Renvoie : 
```json
data: {
  token: token d'invitation
}
```

### /api/groups/:id/chosenquiz (POST)
Fonction : Envoie les résultats du quiz de l'élu.e (qui doit deviner qui a ajouté chacune des musiques).
Requiert que le groupe soit en `SAT_WAITING_QUIZ`.

Corps :
```json
answers: {
  [trackId]: userId (l'utilisateur pense que la track "trackId" a été ajoutée par "userId")
}
```

Ne renvoie rien (204 No Content).

### /api/groups/:id/chosenrank (POST)
Fonction : Envoie le classement par l'élu.e de ses titres préférées
Requiert que le groupe soit en `SAT_WAITING_QUIZ`.

Corps :
```json
ranking: {trackId, userId}[], ordonnées par ordre décroissant de préférence de la track "trackId" ajoutée par "userId"
```

Renvoie : 
Ne renvoie rien (204 No Content).

### /api/groups/:id/predrank (POST)
Fonction : Envoie le classement des préférences de l'élu.e prédit par un.e non-élu.e
Requiert que le groupe soit en `SAT_WAITING_QUIZ`.

Corps :
```json
ranking: {trackId, userId}[], ordonnées par ordre décroissant de préférence prédite de la track "trackId" ajoutée par "userId"
```

Renvoie : 
Ne renvoie rien (204 No Content).

## /api/admin : Routes d'administration

**Routes sécurisées.**
**Chaque requête doit comporter le header `Authorization` qui contient "Bearer [le JWT]".**

Les seules routes API d'administration encore exposées concernent la gestion du temps injecté, qui permet le debug et le test de l'application sans devoir attendre que chaque évènement se produise.

### /api/admin/time (GET)
Fonction : Renvoie l'heure et la date actuellement injectées dans la logique du serveur.

Renvoie :
- serverTime: temps en ISO string

### /api/admin/time/forward (POST)
Fonction : Faire avancer le temps injecté d'un certain nombre d'heures.

Corps :
- hrs: nombre d'heures à avancer

Renvoie un message de succès.

## /api/invites : Invitations

**Routes sécurisées.**
**Chaque requête doit comporter le header `Authorization` qui contient "Bearer [le JWT]".**

### /api/invites/:token (GET)
Fonction : Obtenir des informations sur le token d'invitation.

Renvoie : 
```json
data: {
  group: {
    id,
    name,
    users: User[]
  },
  inviter: {
    id,
    nickname
  },
  isUserInGroup: l'utilisateur qui demande des informations est-il déjà dans le groupe qui correspons à ce token ?
}
```

### /api/invites/:token (POST)
Fonction : Répondre à l'invitation en entrant dans ce groupe.

Renvoie :
- data : Group