# UnisSon
Application mobile de réseau social entre groupes restreints, encourageant le partage de morceaux de façon hebdomadaire et thématique

## Principe de l'application
En groupes de 3 ou plus (il est possible de tester à deux mais la mécanique de classement n'a plus de sens), réunissez-vous entre amis ou en famille pour vous suggérer de la musique entre vous et participer au quiz. Le principe général est le suivant :
- Chaque dimanche, un membre du groupe est choisi et devient l'élu.e de la semaine. L'élu.e choisit un thème.
- Du lundi au vendredi, les autres membres du groupe vont recevoir deux notifications dans la semaine leur proposant de suggérer un morceau à l'élu.e, dans le respect du thème choisi.
- Le samedi, la partie est divisée en deux :
    - L'élu.e doit deviner qui a suggéré chaque morceau, ce qui lui rapportera des points en cas de bonnes réponses. Iel doit également classer les morceaux par ordre de préférence, ce qui rapportera des points aux autres membres en fonction de leur position.
    - Chaque non élu.e découvre les morceaux ajoutés par les autres non élu.e.s, et doit ensuite prédire quelles seront les préférences de l'élu.e. Chacun gagnera des points en fonction de l'accord de sa prédiction avec les préférences réelles de l'élu.e.
- Le dimanche qui suit, chacun voit son score mis à jour et le cycle recommence avec un.e nouvel.le élu.e.

Chaque utilisateur peut inviter d'autres personnes dans son groupe facilement à l'aide de liens d'invitation à travers un service auto-hébergé écrit par nos soins.

## Architecture de l'application

<img width="960" height="540" alt="archi_globale2" src="https://github.com/user-attachments/assets/b6b8695c-eb5f-4cf7-85bb-2b14f9f37c2b" />

### Architecture du frontend

- Nous utilisons React Native avec Expo pour la partie client. Expo simplifie beaucoup la conception, la compilation et le debug par rapport au React Native pur.
- On sépare clairement la vue (pages) et la logique (stores, interactions API, sockets) pour faciliter l'introduction de fonctionnalités futures (push notifications, etc.).
- On utilise des vues sécurisées (pour protéger les pages de groupes, profil, etc. accessibles uniquement après login) et modulaires (une même vue Expo s'adapte au groupe sélectionné et à l'état actuel du groupe soit le jour de la semaine).

### Architecture du backend

- On utilise Node.js/Express avec une architecture routes/contrôleurs/services pour délimiter clairement chaque tâche (+ MariaDB pour la DB).
- La logique de jeu est gérée par une State Machine dont les transitions d'états sont effectuées le moment venu par un système de polling Cron divisé en sous-tâches.
- On utilise un temps injecté pour faciliter le debug (possibilité de faire avancer fictivement le temps serveur).

## Répartition des tâches
- M. Darnaudguilhem : logique et vue (Expo Router) côté front-end, interface/expérience utilisateur, conception et gestion de la base de données, gestion des builds Android & iOS
- P. Bernard : logique côté front-end (réception des events websockets, gestion du login Google, stockage et hydratation pour les stores Zustand, etc.)
- A. Durand : logique côté back-end (écriture de l'API REST, State Machine, interactions DB avec Sequelize, gestion du temps injecté, etc.)

## Self-hosting du backend
Si vous souhaitez lancer le serveur backend sur votre machine et auto-héberger le service, clonez le repository Git, placez-vous dans le dossier `backend/` et lancez (vous devez avoir Node.js installé) :

```bash 
$ npm install
```

Vous devez également avoir un serveur MariaDB, y créer une base de données et un utilisateur, puis créer une app et des client ID sur la Google Cloud Console (remplir le client ID web suffit pour se connecter depuis Android, mais il faut un client ID iOS pour se connecter depuis iOS).

Vous devez ensuite générer un JWT secret, qui est simplement une chaîne aléatoire de 64 caractères.

Remplissez ensuite un fichier `.env` dans le dossier `backend` selon ce modèle :

```bash
DB_HOST=...
DB_DBNAME=...
DB_USER=...
DB_PORT=...
DB_PASSWD=...
JWT_SECRET=..

GOOGLE_WEB_CLIENT_ID=...
GOOGLE_WEB_CLIENT_SECRET=...
GOOGLE_IOS_CLIENT_ID=...
```

Vous pouvez ensuite lancer le service avec :
```bash
$ npm run dev
```

Quand le service est arrêté, vous pouvez aussi lancer les 20 tests unitaires, qui nécessitent d'avoir une DB `asyna_test` avec les permissions accordées à `DB_USER` (renseigné dans `.env`) avec :
```bash
$ npm run test
```
Il faudra cependant modifier l'URL `BACKEND_URL` dans `frontend/api/BackendApi.ts` pour la rediriger vers votre service auto-hébergé, puis rebuild l'APK de l'application Android, comme indiqué ci-dessous.

## Compilation Android
Avec votre téléphone connecté, le SDK Android installé avec ses variables d'environnement configurées et ADB lancé (votre téléphone doit apparaître dans `adb devices`) :
```bash
$ cd ../frontend && npm install && npx expo prebuild && npx expo run:android 
```

## Temps fictif et debug
Par ailleurs, si vous êtes impatient, nous avons inclus un système de debug basé sur un temps fictif côté serveur.
Vous pouvez avancer journée par journée à l'aide d'un bouton situé en haut de l'écran : et oui, si on en abuse, on est déjà en 2027 dans l'application.
Si l'icône ne s'affiche pas en haut à gauche, vous pouvez activer l'option avec le switch situé en bas à gauche dans votre page Profil.
*Petite astuce* : vous profiterez plus du design de l'application en désactivant cette option.
