# Instructions pour créer les tables

## Option 1 : En local (recommandé pour tester)

1. **Configurer `.env.local`** avec votre URL Postgres :
   ```bash
   POSTGRES_URL="postgres://user:password@host:5432/database?sslmode=require"
   ```

2. **Créer les tables** :
   ```bash
   npm run db:migrate
   # ou
   npx prisma migrate dev --name init
   ```

3. **Vérifier** :
   ```bash
   npx prisma studio
   ```
   Cela ouvrira une interface pour voir vos tables.

## Option 2 : Directement sur Vercel (après déploiement)

1. **Connecter votre projet local à Vercel** :
   ```bash
   vercel link
   ```

2. **Récupérer les variables d'environnement** :
   ```bash
   vercel env pull .env.local
   ```

3. **Créer les tables** :
   ```bash
   npx prisma migrate deploy
   ```
   Cette commande applique les migrations à la base de données Vercel.

## Option 3 : Via Vercel Dashboard (automatique)

Si vous avez configuré `POSTGRES_URL` sur Vercel, vous pouvez aussi :

1. Aller dans votre projet Vercel
2. Ouvrir un terminal (si disponible)
3. Exécuter : `npx prisma migrate deploy`

## Vérification

Après avoir créé les tables, l'indicateur sur la page d'accueil devrait passer au vert ✅

## Note importante

- **En développement** : Utilisez `prisma migrate dev` (crée des fichiers de migration)
- **En production** : Utilisez `prisma migrate deploy` (applique les migrations existantes)


