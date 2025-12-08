# The Lana Tip Show ✨

Une application web funky et colorée pour gérer les points de Lana, déployable sur Vercel.

## 🎯 Fonctionnalités

- **Mode Admin** : Distribuer et enlever des points avec des raisons
  - 🔐 **Protégé par mot de passe** (mot de passe par défaut : `admin123`)
  - Gestion des conversions (créer/supprimer)
  - Historique des transactions
  - Possibilité de changer le mot de passe
- **Mode Enfant** : Consulter ses points et voir les conversions possibles
- **Système de conversion** : Échanger des points contre de l'argent de poche, des sorties ou des cadeaux
- **Interface colorée** : Design funky et simple pour une navigation facile

## 🔐 Accès Admin

**Mot de passe par défaut : `admin123`**

⚠️ **Important** : Changez le mot de passe dès la première connexion depuis l'interface admin (bouton "Mot de passe").

## 🚀 Démarrage

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build pour production

```bash
npm run build
npm start
```

## 📦 Configuration Vercel Postgres / Prisma Postgres

### 1. Créer une base de données Postgres sur Vercel

1. Dans votre projet Vercel, allez dans l'onglet **Storage**
2. Cliquez sur **Create Database** > **Postgres** (ou **Prisma Postgres**)
3. Choisissez un nom pour votre base de données
4. Vercel créera automatiquement les variables d'environnement nécessaires

### 2. Créer les tables

**✅ La migration initiale est déjà créée !**

Le fichier de migration se trouve dans `prisma/migrations/20241208000000_init/migration.sql`

**Pour appliquer la migration à votre base de données Vercel :**

1. **Récupérer les variables d'environnement depuis Vercel** :
   ```bash
   vercel link
   vercel env pull .env.local
   ```
   Cela crée un fichier `.env.local` avec votre `POSTGRES_URL` de Vercel.

2. **Appliquer la migration** :
   ```bash
   npm run db:deploy
   # ou
   npx prisma migrate deploy
   ```
   
   Cette commande applique la migration à votre base de données Vercel et crée toutes les tables.

**Alternative : Utiliser `db push` (pour développement rapide)**

```bash
npm run db:push
```
Cette commande synchronise le schéma directement sans créer de fichier de migration.

**Vérification :**

L'indicateur sur la page d'accueil devrait passer au vert ✅ une fois les tables créées.

### 3. Générer le client Prisma

Le client Prisma est généré automatiquement lors de `npm install` (via `postinstall`).

Si besoin manuellement :
```bash
npm run db:generate
# ou
npx prisma generate
```

### 3. Variables d'environnement

Vercel configure automatiquement :
- `POSTGRES_URL` - URL de connexion principale
- `PRISMA_DATABASE_URL` - URL Prisma (si Prisma Postgres)
- `POSTGRES_PRISMA_URL` - URL Prisma alternative

**Important** : Assurez-vous que `POSTGRES_URL` est bien configurée dans les variables d'environnement Vercel.

## 📦 Déploiement sur Vercel

### Configuration requise

- ✅ **Créer une base de données Postgres** dans Vercel (Storage > Create Database)
- ✅ Vercel détecte automatiquement Next.js et utilise les commandes par défaut
- ✅ Les variables d'environnement Postgres sont configurées automatiquement

### Étapes de déploiement

1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement :
   - Framework : Next.js
   - Commande d'installation : `npm install` (automatique)
   - Commande de build : `npm run build` (automatique)
3. Cliquez sur "Deploy" !

Ou utilisez la CLI Vercel :

```bash
npm i -g vercel
vercel
```

**C'est tout !** Aucune configuration supplémentaire n'est nécessaire.

## 🎨 Technologies utilisées

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icônes)
- Vercel Postgres (base de données PostgreSQL intégrée)
- API Routes Next.js

## 📝 Notes

Les données sont stockées dans Vercel Postgres, ce qui garantit une persistance fiable et accessible depuis n'importe quel appareil. Les tables sont créées automatiquement au premier lancement.

