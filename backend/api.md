# Documentation de l'API backend d'UnisSon
(C) Tous droits réservés UnisSon Corporation.

## /auth : Routes d'authentification
### /auth/signup (POST)
Fonction : Enregistre un utilisateur.

Corps    : 
- nickname : Pseudo
- email : Email

Renvoie : 
- id : ID de l'utilisateur créé.

### /auth/login (POST)
Fonction : Se connecter.

Corps    : 
- nickname : Pseudo

Renvoie : 
- id : ID de l'utilisateur, pour les futures requêtes.

### /auth/google (POST)
Fonction : S'inscrire/se connecter avec un token Google.

Corps : 
- idToken : ID token d'OAuth Google

Renvoie :
- token : JWT nécessaire plus tard pour l'accès aux routes protégées
- userID : ID de l'utilisateur soit existant, soit créé

## /users/ : Routes concernant l'utilisateur
**Routes sécurisées.**

**Chaque requête doit comporter le header `authorization` qui contient "Bearer [le JWT]".**

### /users/me/groups (GET)
Fonction : Liste les groupes auxquels appartient l'utilisateur.

Renvoie :
Un tableau dont chaque entrée correspond à un groupe.
Pour chaque groupe :
- id : ID du groupe
- name : Nom du groupe

## /groups/ : Routes concernant les groupes
**Routes sécurisées.**
**Chaque requête doit comporter le header `authorization` qui contient "Bearer [le JWT]".**

**Remplacer `:id` dans l'URL par l'ID du groupe concerné.**

### /groups/ (POST)
Fonction : Créer un groupe.

Corps : 
- groupName : Nom du groupe.

Renvoie :
- groupId : ID du groupe créé.

### /groups/:id/members (GET)
Fonction : Liste les membres de ce groupe.

Renvoie :
Un tableau des membres.
Pour chaque membre :
- id : ID du membre
- nickname : Pseudo du membre

### /groups/:id/members (POST)
Fonction : Rejoindre ce groupe.

Renvoie :
 - message : Un message de succès.

### /groups/:id/theme (POST)
Fonction : Ajouter le thème de la semaine.
Uniquement accessible par l'élu.e

Renvoie :
 - message : Un message de succès.

### /groups/:id/songs (GET)
Fonction : Renvoie les musiques ajoutées cette semaine.

Renvoie :
Une liste de titres.
Pour chaque titre :
- id : L'ID du titre dans la table Tracks.
- title : Le titre du morceau.
- youtubeLink : Le lien YouTube du morceau.
- userID : L'ID de l'utilisateur qui a ajouté ce morceau.

### /groups/:id/songs (POST)
Fonction : Ajoute une musique à la sélection de la semaine.

Corps :
- title : Titre du son.
- youtubeUrl : Lien du morceau sur YouTube.

Renvoie : 
- message : Un message de succès.
- trackId : L'ID du titre ajouté dans la table Tracks.

## /admin : Routes d'administration

### /admin/poll : Déclencher le polling manuellement
Par défaut, le polling (vérifier si c'est l'heure de déclencher des évènements) se fait automatiquement toutes les minutes, mais il peut être déclenché par un POST sur `/poll`.

Attention à ne pas trop `poll`-uer le serveur avec ça ! ahaha (Penser à enlever cette phrase)

### /admin/newcycle : Déclencher un nouveau cycle

### /admin/submode : Passer en mode "ajout de musique"

### /admin/quiztime : Passer en mode "quiz"