# Serveur

Le but ici est de créer un serveur de streaming vidéo. Il proposera une liste des vidéos disponibles, puis le visionnage de ces vidéos.

## Création des fichiers

1. .gitignore

Ce fichier indique à git les éléments à ****ne pas**** synchroniser avec le repository distant. 

Lorsque l'on travaille avec node, l'installation des packages s'effectue dans le dossier node_modules, il faut donc le supprimer de git. Un second fichier est également superflu, il s'agit de package-lock.json.

Voici à quoi doit ressembler votre fichier .gitignore :
```
node_modules
package-lock.json
```

2. server.js

Ce fichier est le point d'entrée de notre application. Il contient le code que nous allons écrire.

3. package.json

Ce fichier, généré lors de l'initialisation du module par npm, contient la configuration de votre serveur nodeJS. Il indique le nom de votre projet, sa description, l'auteur, la licence... Mais surtout les modules externes, les dépendances de développement et les scripts divers.
Lorsque vous allez installer des dépendances, c'est ici qu'elles apparaitront.

Modifier ce fichier en affectant le point d'entrée correct : 
```json
"main": "server.js"
```

Puis en ajoutant un script permettant le lancement de l'application :
```json
"scripts": {
    "start" : "nodemon server.js"
}
```

Enfin, installez nodemon en tant que dépendance de développement :
```
npm install --dev nodemon
```

Nous sommes prêt à coder.

## Développement du serveur

NodeJS est un environnement d'execution rendant possible l'execution de javascript sur une machine. Avant sa création, le javascript ne pouvait s'éxécuter que dans le navigateur.

Pour créer un serveur, nous allons utiliser [express](http://expressjs.com).
Dans la cli, executer la ligne suivante :
```
npm install express
```
Ensuite, rendez vous dans le fichier server.js et écrivez ces instructions :
```js
const express = require('express')

app = express()

app.get('/', (req, res) => {
    res.send('hello world')
})

// Ceci est la dernière instruction du fichier, veillez à la garder tout en bas par la suite
app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
```

Lancer la commande ```npm start``` dans votre cli, et si tous se passe bien vous devriez pouvoir aller sur votre navigateur, entrer l'url http://localhost:3000 et recevoir un joli hello world.

### Ajout du service de streaming vidéo
Pour bien commencer, placez une vidéo au format mp4 dans votre dossier. Modifiez son nom pour correspondre à ```video.mp4```.

Ensuite, il vous faudra créer une route spécifique dédiée au streaming de cette vidéo.

Pour cela, ajouter le code suivant : 
```js
app.get("/video", function (req, res) {

})
```
Ici, ```get``` indique le verbe http utilisé et l'argument ```/video``` identifie le nom de la route.

A l'intérieur des accolades, écrivez le code suivant :
```js
const path = "video.mp4";
const stat = fs.statSync(path);
const fileSize = stat.size;
const range = req.headers.range;
```

Comme vous vous en doutez, ```"video.mp4"``` est le nom de votre fichier vidéo. ```fs.statSync(path)``` est une fonction qui extrait les informations du fichier (comme sa taille via ```stat.size```).

Nous récuperont également des headers la ```range```, qui indique la portion de la video à charger.

Continuons en indiquant les instructions de chargement de cette vidéo :
```js
// Si la requête indique une plage (range) dans les headers le requête
if (range) {
    // Extraction des indications de la plage, en supprimant les mots superflus
    const parts = range.replace(/bytes=/, "").split("-");

    // Passage du binaire en base 10
    const start = parseInt(parts[0], 10);

    // Si une fin est définie, on l'extrait également. Sinon la fin correspond à la taille du fichier
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Si la plage de début indiquée est supérieure à la taille du fichier, on renvoie une erreur
    if (start >= fileSize) {
      res
        .status(416)
        .send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    // Création de la portion de la vidéo à envoyer
    const chunksize = end - start + 1;

    // Création du stream (chargement partiel du fichier) local
    const file = fs.createReadStream(path, { start, end });

    // Définition des headers de la réponse
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    // Envoi du stream local en réponse
    res.writeHead(206, head);
    file.pipe(res);
}

// Si aucune plage n'est spécifiée, on envoi l'entiereté du fichier (utile pour pouvoir le télécharger)
else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
}
```

Nous voila avec un serveur fonctionnel. Voici le fichier complet (sans les commentaires) :
```js
const express = require("express");
const fs = require("fs");
const path = require("path");

app = express();

app.get("/video", function (req, res) {
  const path = "video.mp4";
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res
        .status(416)
        .send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } 
  
  else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
}); 
``` 

### Création du HTML

Maintenant que le serveur fonctionne, il ne nous reste plus qu'à créer le fichier HTML pour accéder au service depuis le navigateur.

Créons donc le fichier ```index.htm``` dans notre dossier, et y inscrire le code suivant :
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Tutoriel Video</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
</head>

<body>

    <video id="videoPlayer" controls muted="muted">
        <source src="/video" type="video/mp4">
    </video>

</body>

</html>
```

Pour finir, ajouter cette route dans le fichier ```server.js``` pour rendre disponible le fichier html precedement créé :
```js
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})
```

## Conclusion
Rendez vous sur votre navigateur à l'url http://localhost:3000 et profitez de votre serveur de streaming !