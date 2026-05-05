# UnisSon
Application mobile de réseau social entre groupes restreints, encourageant le partage de morceaux de façon hebdomabadaire et thématique

## Principe de l'application
En groupes de 3 ou plus (il est possible de tester à deux mais la mécanique de classement n'a plus de sens), réunissez-vous entre amis ou en famille pour vous suggérer de la musique entre vous et participer au quiz. Le principe général est le suivant :
- Chaque dimanche, un membre du groupe est choisi et devient l'élu.e de la semaine. L'élu.e choisit un thème.
- Du lundi au vendredi, les autres membres du groupe vont recevoir deux notifications dans la semaine leur proposant de suggérer un morceau à l'élu.e, dans le respect du thème choisi.
- Le samedi, la partie est divisée en deux :
    - L'élu.e doit deviner qui a qui suggéré chaque morceau, ce qui lui rapportera des points en cas de bonnes réponses. Il doit également classer les morceaux par ordre de préférence, ce qui rapportera des points aux autres membres en fonction de leur position.
    - Chaque non élu.e découvre les morceaux ajoutés par les autres non élu.e.s, et doit ensuite prédire quelles seront les préférences de l'élu.e. Chacun gagnera des points en fonction de l'accord de sa prédiction avec les préférences réelles de l'élu.e.
- Le dimanche qui suit, chacun voit son score mis à jour et le cycle recommence avec un.e nouvel.le élu.e.

## Lancement de l'application
### Sur Android
Pour tester sur Android, il vous suffit d'installer le fichier `.apk` présent dans le dossier `build`.

### Sur iOS
Pour tester sur iOS, il vous faut installer Unisson depuis Altstore, ou alors installer le fichier `.ipa` du dossier `build`.

La partie backend du service étant constamment fonctionnelle sur notre VPS, vous pouvez tester l'application n'importe quand. Il faut simplement utiliser un compte Google que nous avons ajouté dans les test users d'Unisson sur la Cloud Console, puisque notre application n'est pas encore vérifiée par Google.

## Self-hosting du backend
Si vous souhaitez lancer le serveur backend sur votre machine et auto-héberger le service, clonez le repository Git, placez vous dans le dossier `backend/` et lancez (vous devez avoir Node.js installé) :

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

Quand le service est arrếté, vous pouvez aussi lancer les 20 tests unitaires, qui nécessitent d'avoir une DB `asyna_test` avec les permissions accordées à `DB_USER` (renseigné dans `.env`) avec :
```bash
$ npm run test
```
Il faudra cependant modifier l'URL `BACKEND_URL` dans `frontend/api/BackendApi.ts` pour la rediriger vers votre service auto-hébergé, puis rebuild l'APK de l'application Android, comme indiqué ci-dessous.

## Compilation Android
Avec votre téléphone connecté, le SDK Android installé avec ses variables d'environnement configurées et ADB lancé (votre téléphone doit apparaître dans `adb devices`) :
```bash
$ cd ../frontend && npm install && npx expo prebuild && npx expo run:android 
```