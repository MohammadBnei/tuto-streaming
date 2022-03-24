# Initialisation

## Prérequis

- Git (optionnel)
- NVM | Node version 16
- VSCode ou autre éditeur de texte

## Installation

1. Création d'un dossier : 
```
mkdir tuto-streaming
cd tuto-streaming
```

2. Configuration de node
```
# Si utilisation de nvm
nvm install 16
nvm use 16

npm init
# Répondre aux questions

git init
```

3. Créer un repository git sur un navigateur, ensuite le lier au dossier sur la machine.
```
# Remplacer les variables avec un $ devant par la valeur associée
git remote add origin $REPOSITORY_URL
git push -u origin master
```

5. Si tout s'est bien passé, vous pouvez ouvrir votre éditeur de texte dans le dossier correct.
```
code .
```