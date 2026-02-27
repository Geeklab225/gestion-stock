# LM-Code Gestion Stock

Application de gestion de stock professionnelle avec separation stricte Frontend/API, structure orientee Clean Architecture, migrations SQL versionnees et interface moderne en francais.

![alt text](image-1.png)

## Identite projet
- Nom produit: `LM-Code Gestion Stock`
- Developpeur: `Michael - LM-Code`
- Site: `https://lm-code.be`
- Depot source: `https://github.com/LM-Code-Be/gestion-stock`

## Architecture
- `frontend/`: interface utilisateur (HTML/CSS/JS), aucune logique metier backend.
- `backend/public/index.php`: point d'entree API (`/api/v1/...`).
- `backend/src/Domain`: entites et regles metier.
- `backend/src/Application`: cas d'usage.
- `backend/src/Infrastructure`: persistence, services techniques.
- `backend/src/Presentation`: controleurs HTTP, DTO, validation.
- `database/migrations/up|down`: scripts de migration.
- `database/seeders/pro`: jeux de donnees initiaux.
- `config/database.php`: configuration BDD prioritaire (fichier principal).

## Fonctionnalites principales

![alt text](image.png)

- Referentiels: produits, categories, unites, marques, taxes, tags.
- Tiers: fournisseurs et clients.
- Stock: entrees, sorties, transferts, ajustements, inventaires.
- Achats: commandes, receptions partielles/totales, suivi des statuts.
- Pilotage: dashboard KPI, exports CSV, rapports.
- Administration: roles, utilisateurs, audit.
- Avance: import CSV multi-entites, pieces jointes, etiquettes/code-barres.

## Prerequis
- WAMP (Apache + MySQL) actif.
- PHP 8.1+ recommande.
- MySQL 8.x (ou compatible).
- Extension PDO MySQL active.

## Installation WAMP (BDD jamais creee)
1. Copier le projet dans `c:\wamp64\www\gestion-stock`.
2. Demarrer WAMP et verifier que `Apache` + `MySQL` sont en vert.
3. Creer la base vide (phpMyAdmin ou SQL):

```sql
CREATE DATABASE IF NOT EXISTS gestion_stock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

4. Configurer les acces MySQL dans `config/database.php`.

Exemple:

```php
return [
    'host' => '127.0.0.1',
    'port' => 3306,
    'dbname' => 'gestion_stock',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
];
```

## Ou definir login / password MySQL
- Fichier principal: `config/database.php`
- Fallback backend: `backend/config/database.php`

Champs a renseigner:
- `username` = login MySQL
- `password` = mot de passe MySQL
- `dbname` = nom de la base
- `host` et `port` selon votre serveur

## Migrations et seed
Depuis la racine du projet:

```bash
php backend/bin/migrate.php up
php backend/bin/seed.php
```

Commandes utiles:

```bash
php backend/bin/migrate.php status
php backend/bin/migrate.php down
php backend/bin/migrate.php fresh
```

## Lancer et tester manuellement
- Login: `http://localhost/gestion-stock/frontend/login.php`
- App: `http://localhost/gestion-stock/frontend/index.php`
- API health: `http://localhost/gestion-stock/backend/public/api/v1/health`

Compte pour se connecter après migration:
- Email: `stock@lm-code.be`
- Mot de passe: `lm-code123`

## Git
Le projet local est initialise et lie au depot:

```bash
git remote -v
# origin https://github.com/LM-Code-Be/gestion-stock.git (fetch)
# origin https://github.com/LM-Code-Be/gestion-stock.git (push)
```

Pour premier push:

```bash
git add .
git commit -m "Initialisation LM-Code Gestion Stock"
git push -u origin main
```

## Liens utiles
- Site LM-Code: `https://lm-code.be`
- Tutoriel complet LM-Code: `https://lm-code.be/tutoriel-app-gestion-stock-php-mysql/`
- GitHub LM-Code: `https://github.com/LM-Code-Be/`
- Contact: `https://lm-code.be/contact/`
- Code source projet: `https://github.com/LM-Code-Be/gestion-stock`
