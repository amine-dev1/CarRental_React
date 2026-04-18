# Migration du Plan Free vers Standard

## 📋 Résumé des changements

Le plan "Free" a été remplacé par "Standard" à travers tout le système, avec les nouvelles caractéristiques suivantes :

### 🎯 Plan Standard
- **Prix**: 29€ par mois
- **Essai gratuit**: 1 mois sans enregistrement de carte bancaire
- **Limites**: 
  - Jusqu'à 5 véhicules
  - 2 utilisateurs maximum
  - Gestion des réservations de base
  - Tableau de bord simplifié
  - Support par email
  - Hébergement partagé

## 🔧 Fichiers modifiés

### Frontend
1. **src/components/landing/Pricing.jsx** - Mise à jour de la section tarifaire avec le prix de 29€ et l'essai gratuit
2. **src/utils/features.js** - Remplacement de toutes les références "Free" par "Standard"
3. **src/pages/superadmin/Enterprises.jsx** - Mise à jour du formulaire de création d'entreprise
4. **src/pages/director/DirectorDashboard.jsx** - Mise à jour de la logique de routage
5. **src/pages/director/DashboardStandard.jsx** - Nouveau fichier (anciennement DashboardFree.jsx)
6. **src/components/dashboard/PlanBadge.jsx** - Mise à jour des styles de badge

### Backend
1. **src/schema.sql** - Changement du plan par défaut de 'Free' à 'Standard'
2. **src/utils/features.js** - Remplacement de toutes les références "Free" par "Standard"
3. **src/routes/superadmin.js** - Mise à jour des schémas de validation Zod

### Scripts de migration
1. **scripts/migrate_free_to_standard.sql** - Script SQL de migration
2. **scripts/migrate_free_to_standard.js** - Script Node.js pour exécuter la migration

## 🚀 Instructions de migration

### 1. Arrêter les serveurs
```bash
# Arrêter le frontend et le backend si nécessaire
```

### 2. Exécuter la migration de la base de données
```bash
cd backend
node scripts/migrate_free_to_standard.js
```

Ce script va :
- Compter les entreprises avec le plan "Free"
- Mettre à jour tous les plans "Free" vers "Standard"
- Afficher un résumé de la migration

### 3. Redémarrer les serveurs
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

## ✅ Vérification

Après la migration, vérifiez que :
1. Toutes les entreprises précédemment "Free" sont maintenant "Standard"
2. Le formulaire de création d'entreprise propose "Standard" comme option par défaut
3. La page de tarification affiche correctement 29€/mois avec l'essai gratuit
4. Les dashboards des directeurs affichent "Plan Standard"
5. Les badges de plan affichent "STANDARD" au lieu de "FREE"

## 📝 Notes importantes

- **Ancien fichier**: `DashboardFree.jsx` peut être supprimé manuellement si nécessaire (un nouveau `DashboardStandard.jsx` a été créé)
- **Compatibilité**: Les limites du plan restent les mêmes (5 véhicules, 2 utilisateurs)
- **Prix**: Le plan Standard est maintenant payant à 29€/mois avec 1 mois d'essai gratuit
- **Essai gratuit**: Aucune carte bancaire requise pendant la période d'essai

## 🎨 Changements visuels

1. **Badge du plan**: Continue d'afficher un style gris pour Standard (comme avant pour Free)
2. **Section tarifaire**: Affiche maintenant "29€/mois" avec un badge vert "✨ 1 mois d'essai gratuit sans carte bancaire"
3. **Bouton d'action**: "Essayer gratuitement" au lieu de "Démarrer gratuitement"

## 🔄 Rollback (si nécessaire)

En cas de problème, vous pouvez revenir en arrière en :
1. Exécutant le script SQL inverse : `UPDATE enterprises SET plan = 'Free' WHERE plan = 'Standard'`
2. Restaurant les fichiers depuis Git

---

**Date de migration**: 2026-02-17  
**Version**: 1.0.0
