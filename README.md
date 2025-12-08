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

## 📦 Déploiement sur Vercel

### Configuration requise : **AUCUNE** ✅

- ❌ **Pas de variables d'environnement** à configurer
- ❌ **Pas de commandes d'installation spéciales** à spécifier
- ✅ Vercel détecte automatiquement Next.js et utilise les commandes par défaut

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
- LocalStorage (stockage des données)

## 📝 Notes

Les données sont stockées dans le localStorage du navigateur. Pour une utilisation en production avec plusieurs utilisateurs, considérez l'ajout d'une base de données.

