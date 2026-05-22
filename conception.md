# Conception du Système de Location de Voitures (CarRental_React)

Ce document détaille l'architecture, la conception technique et la structure du projet.

---

## 1. Architecture Globale
L'application suit une architecture client-serveur moderne :
- **Frontend** : Application Single Page (SPA) développée avec **React** et **Vite**.
- **Backend** : API REST développée avec **Node.js** et **Express**.
- **Base de données** : Relationnelle avec **PostgreSQL** (Multi-tenant).
- **Authentification** : Basée sur des tokens **JWT** avec gestion de rôles et permissions.
- **Paiements** : Intégration de **Stripe** et **PayPal** pour les abonnements et locations.

---

## 2. Schéma de la Base de Données (DB)
Le système utilise une architecture multi-tenant isolée par `enterprise_id`.

### Tables Principales :
| Table | Description | Colonnes Clés |
| :--- | :--- | :--- |
| **enterprises** | Entités locatrices (tenants) | `id`, `name`, `plan` (Standard/Pro/Enterprise), `subscription_status`, `currency` |
| **users** | Utilisateurs (Admin/Staff) | `id`, `enterprise_id`, `email`, `role` (superadmin/director/agent), `password_hash` |
| **customers** | Clients finaux | `id`, `enterprise_id`, `full_name`, `driver_license_number`, `id_card_urls` |
| **vehicles** | Flotte de véhicules | `id`, `enterprise_id`, `plate`, `model`, `daily_price_cents`, `status` (available/maintenance) |
| **vehicle_categories**| Catégories de prix | `id`, `enterprise_id`, `name`, `daily_price_cents`, `color` |
| **rentals** | Contrats de location | `id`, `vehicle_id`, `customer_id`, `start_date`, `end_date`, `status` (reserved/active/completed) |
| **payments** | Transactions | `id`, `rental_id`, `amount_cents`, `method` (cash/card/transfer), `transaction_id` |
| **vehicle_maintenance**| Suivi entretien | `id`, `vehicle_id`, `type`, `cost_cents`, `performed_at` |
| **notifications** | Alertes système | `id`, `user_id`, `type`, `message`, `is_read` |
| **pricing_rules** | Règles tarifaires | `id`, `rule_type` (seasonal/weekly), `discount_percent`, `is_active` |

### Contraintes & Sécurité :
- **Double Réservation** : Empêchée par une contrainte d'exclusion `gist` sur les périodes de location par véhicule.
- **Isolation des Données** : Chaque requête SQL filtre par `enterprise_id` pour assurer la confidentialité entre agences.

---

## 3. Structure du Backend (Repository)
Le backend est organisé de manière modulaire pour faciliter la maintenance et la scalabilité.

### Architecture des Dossiers :
- `src/` : Code source principal.
  - `routes/` : Définition des endpoints API (ex: `auth.js`, `vehicles.js`, `rentals.js`).
  - `middleware/` : Logique intermédiaire (Auth, Validation, Rate Limiting, Error Handling).
  - `lib/` : Bibliothèques partagées (Logger Winston, Validation d'environnement Zod).
  - `utils/` : Fonctions utilitaires (Calculs de prix, génération de PDF).
  - `schemas/` : Définitions de validation de données (Zod).
  - `db.js` : Configuration du pool de connexion PostgreSQL.
  - `schema.sql` : Script de création de la structure de la base de données.

### Middlewares Clés :
- **`securityHeaders`** : Configuration Helmet et Content Security Policy (CSP).
- **`apiLimiter`** : Limitation du débit de requêtes pour prévenir les abus.
- **`authenticateToken`** : Extraction et validation du JWT.
- **`requirePermission`** : Vérification granulaire des droits (ex: `fleet.manage`, `reports.view`).

---

## 4. Structure du Frontend
Développé avec React, utilisant une approche basée sur les composants et les contextes.

### Architecture des Dossiers :
- `src/`
  - `components/` : Composants UI réutilisables.
    - `dashboard/` : Widgets spécifiques (Stats, Compteurs d'abonnements).
    - `common/` : Inputs, Boutons, Selects personnalisés, Toasts.
    - `landing/` : Sections de la page d'accueil.
  - `pages/` : Vues principales de l'application.
    - `auth/` : Login, Register, Reset Password.
    - `superadmin/` : Gestion des entreprises et réclamations.
    - `director/` : Fleet, Customers, Rentals, Administration, Pricing.
  - `context/` : Gestion de l'état global (**AuthContext**, **CurrencyContext**).
  - `api/` : Services d'appels à l'API backend (Axios).
  - `layouts/` : Structures de page (**DirectorLayout**, **SuperAdminLayout**).

### Composants UI Notables :
- **`PhoneInput`** : Gestion complexe des numéros de téléphone internationaux.
- **`CountryCitySelect`** : Sélecteur dynamique lié.
- **`LockedFeature`** : Composant gérant l'accès aux fonctionnalités selon le plan d'abonnement.
- **`CustomToasts`** : Système de notifications visuelles élégant.

---

## 5. Flux de Travail (Workflow)
1. **Onboarding** : Inscription d'une agence -> Choix du plan -> Paiement via passerelle.
2. **Setup** : Création des catégories -> Ajout des véhicules -> Configuration de l'équipe.
3. **Opérationnel** : Création client -> Vérification disponibilité -> Signature contrat -> Paiement.
4. **Maintenance** : Suivi des alertes entretien -> Mise en maintenance automatique des véhicules.
5. **Analyse** : Consultation des rapports de revenus et taux d'occupation via le dashboard.
