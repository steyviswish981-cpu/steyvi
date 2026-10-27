# Steyvi – mise en ligne sur Netlify

## 1. Mettre le dossier sur GitHub
1. Crée un dépôt (ex. `steyvi`) sur github.com.
2. Téléverse tout le contenu de ce dossier : `index.html`, `netlify.toml`, `package.json`, le dossier `netlify/`.

## 2. Connecter Netlify
1. app.netlify.com → **Add new site** → **Import an existing project** → GitHub → ton dépôt.
2. Avant de déployer : **Environment variables** → ajoute `STEYVI_MDP` avec ton mot de passe propriétaire.
3. **Deploy**.

## 3. Recevoir un e-mail à chaque commande
Site configuration → **Forms** → **Form notifications** → **Add notification** → **Email notification** → formulaire `commandes` → ton adresse e-mail.

## 4. Vérifier
- `https://ton-site.netlify.app/.netlify/functions/donnees` affiche du texte JSON (sinon la fonction n'est pas déployée).
- Passe une commande de test : l'e-mail arrive, et la commande apparaît dans l'espace propriétaire (menu → ouvrir avec `#gestion` à la fin de l'adresse, ou 5 appuis sur le logo).
- À la première connexion propriétaire, la boutique est initialisée avec tes produits.

## Notes
- Le mot de passe propriétaire ne doit jamais être écrit dans le code : il reste dans `STEYVI_MDP`.
- Les photos sont réduites automatiquement ; garde-les légères.
