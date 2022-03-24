# Serveur

Le but ici est de créer un serveur de streaming vidéo. Il proposera une liste des vidéos disponibles, puis le visionnage de ces vidéos.

## Création des fichiers et dossiers

1. .gitignore

Ce fichier indique à git les éléments à ne pas synchroniser avec le repository distant. 

Lorsque l'on travaille avec node, l'installation des packages s'effectue dans le dossier node_modules, il faut donc le supprimer de git. Un second fichier est également superflu, il s'agit de package-lock.json.

Voici à quoi doit ressembler votre fichier .gitignore :
```
node_modules
package-lock.json
```