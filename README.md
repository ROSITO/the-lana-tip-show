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

## 📦 Configuration Vercel Postgres

### 1. Créer une base de données Postgres sur Vercel

1. Dans votre projet Vercel, allez dans l'onglet **Storage**
2. Cliquez sur **Create Database** > **Postgres**
3. Choisissez un nom pour votre base de données
4. Vercel créera automatiquement les variables d'environnement nécessaires

### 2. Les tables sont créées automatiquement

Les tables sont créées automatiquement au premier appel API. Aucune configuration manuelle nécessaire !

### 3. Variables d'environnement

Vercel configure automatiquement :
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

Ces variables sont automatiquement disponibles dans votre application.

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

