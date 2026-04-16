# Documentation de l'API backend d'UnisSon
(C) Tous droits réservés UnisSon Corporation.

# Types de retour
Selon le cas :
## Succès
- 200 OK : la requête a fonctionné, on renvoie des données
- 201 Resource created : la requête a fonctionné, on renvoie des données, le 201 est juste là pour dire que la requête a entraîné la création d'une ressource côté serveur (pour rester dans les normes REST)
En cas de succès, l'API renvoie un objet `{data: [les données]}`.
Ces données peuvent une ressource élementaire de la BDD (User, Group, Track), un table de ressource élementaire (genre User[]) ou un objet spécifique (ex: liens d'invitation).

### User (exemple)

```json
{
  "id": 42,
  "nickname": "musicLover",
  "email": "user@example.com",
  "profileDescription": "I hate discovering new tracks",
  "profilePicture": "base64-encoded-image-or-null",
  "provider": "spotify",
  "premiumAccount": true,
  "providerLoginID": "spotify_123456",
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here",
  "tokenExpireAt": "2026-04-20T15:30:00.000Z",
  "pushToken": "expo_push_token",
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-04-15T18:00:00.000Z"
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
  "theme": "Summer vibes (my girlfriend left me)"
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
  "ISRC": "USUG11904256",
  "youtubeLink": "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
  "createdAt": "2026-02-01T12:00:00.000Z",
  "updatedAt": "2026-04-10T12:00:00.000Z"
}
```

## Erreurs
- 400 Bad Requeset : il manque quelque chose de la requête
- 401 Unauthorized : la ressource est sécurisée mais il manque le données d'auth. dans la requête (typiquement, JWT)
- 403 Forbidden : l'authentification n'a pas fonctionné (soit le JWT a expiré, est invalide...) ou alors l'utilisateur n'est pas autorisé à faire cette requête (user en dehors du group, etc.)

S'il y a une erreur l'API renvoie :
```json
{
    "error": {
        "message": [le message]
    }
}
```

## /api/auth : Routes d'authentification
### /api/auth/signup (POST)
Fonction : Enregistre un utilisateur.

Corps    : 
- nickname : Pseudo
- email : Email

Renvoie : 
- data : User

### /auth/login (POST)
Fonction : Se connecter.

Corps    : 
- nickname : Pseudo

Renvoie : 
- data : User

### /auth/google (POST)
Fonction : S'inscrire/se connecter avec un token Google.

Corps : 
- idToken : ID token d'OAuth Google

Renvoie : 
- data : User

## /api/users/ : Routes concernant l'utilisateur
**Routes sécurisées.**

**Chaque requête doit comporter le header `Authorization` qui contient "Bearer [le JWT]".**

### /api/users/me/groups (GET)
Fonction : Liste les groupes auxquels appartient l'utilisateur.

Renvoie :
- data : Group[]

## /api/groups/ : Routes concernant les groupes
**Routes sécurisées.**
**Chaque requête doit comporter le header `authorization` qui contient "Bearer [le JWT]".**

**Remplacer `:id` dans l'URL par l'ID du groupe concerné.**

### /api/groups/ (GET)
Fonction : Infos sur un groupe

Renvoie :
- data : Group

### /api/groups/ (POST)
Fonction : Créer un groupe.

Corps : 
- name : Nom du groupe.

Renvoie :
- data : Group

### /api/groups/:id/members (GET)
Fonction : Liste les membres de ce groupe.

Renvoie :
- data : User[]

### /api/groups/:id/members (POST)
Fonction : Rejoindre ce groupe.

Renvoie :
 - data : Group

### /api/groups/:id/theme (POST)
Fonction : Ajouter le thème de la semaine.
Uniquement accessible par l'élu.e

Renvoie :
 - data : Group

### /api/groups/:id/songs (GET)
Fonction : Renvoie les musiques ajoutées cette semaine.

Renvoie :
- data : Track[]

### /api/groups/:id/songs (POST)
Fonction : Ajoute une musique à la sélection de la semaine.

Corps :
- title : Titre du son.
- youtubeLink : Lien du morceau sur YouTube.

Renvoie : 
- data : Track[]

## /api/admin : Routes d'administration

### /api/admin/poll : Déclencher le polling manuellement
Par défaut, le polling (vérifier si c'est l'heure de déclencher des évènements) se fait automatiquement toutes les minutes, mais il peut être déclenché par un POST sur `/poll`.

Attention à ne pas trop `poll`-uer le serveur avec ça ! ahaha (Penser à enlever cette phrase)

### /api/admin/newcycle : Déclencher un nouveau cycle

### /api/admin/submode : Passer en mode "ajout de musique"

### /api/admin/quiztime : Passer en mode "quiz"