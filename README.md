🚀  TERRABIA - Plateforme E-commerce de Produits Terroir 

Une plateforme e-commerce moderne et modulaire spécialisée dans la vente de produits du terroir, construite avec une architecture de microservices.

📋 Table des Matières
Présentation

Architecture

Fonctionnalités

Prérequis

Installation et Démarrage

Déploiement

Structure du Projet

Contributions

Licence

🎯 Présentation du Projet
TERRABIA est une solution e-commerce complète permettant la gestion et la vente en ligne de produits du terroir. L'application repose sur une architecture de microservices pour assurer scalabilité, maintenabilité et résilience.

Technologies principales : Python, React, Docker, Kubernetes, Spring Cloud (Eureka)

🏗️ Architecture
Le projet suit une architecture de microservices avec les composants suivants :

text
TERRABIA/
├── docker-compose.yml
├── eureka_register.json
├── frontend
├── k8s
├── node_modules
├── package.json
├── package-lock.json
├── README.md
├── start-all.sh
├── terra-auth-service
├── terra-cloud-conf
├── terra-conf-service
├── terra-notification-service
├── terra-order-transaction-service
├── terra-product-service
├── terra-proxy-service
├── terra-registry-service
├── terra-users-service
├── Untitled
└── venv
✨ Fonctionnalités par Service
Service	Langage	Responsabilités
frontend	JavaScript/React	Interface utilisateur responsive
terra-auth-service	Python	Authentification, autorisation, JWT
terra-users-service	Python	Gestion des profils utilisateurs
terra-product-service	Python	Catalogue, catégories, stocks
terra-order-transaction-service	Python	Panier, commandes, paiements
terra-notification-service	Python	Emails, notifications en temps réel
terra-registry-service	Java/Spring	Découverte de services (Eureka)
terra-proxy-service	Java/Spring	Routage, agrégation d'API
📦 Prérequis
Docker et Docker Compose (pour le développement local)

Python 3.9+ (pour les services Python)

Node.js 16+ et npm (pour le frontend)

Java 11+ (pour les services Spring/Eureka)

kubectl et Minikube (pour le déploiement Kubernetes)

🚀 Installation et Démarrage
1. Cloner le dépôt
bash
git clone https://github.com/TP-Master1-GL/TERRABIA.git
cd TERRABIA
2. Démarrage avec Docker Compose (Recommandé pour le développement)
bash
# Lancer tous les services
docker-compose up -d

# Ou utiliser le script fourni
chmod +x start-all.sh
./start-all.sh
3. Démarrage manuel des services
bash
# 1. Démarrer le service de registry (Eureka)
cd terra-registry-service
# Suivre les instructions du service...

# 2. Démarrer les microservices
# Chaque service possède son propre README avec instructions

# 3. Démarrer le frontend
cd frontend
npm install
npm run dev
🐳 Déploiement
Déploiement avec Kubernetes
Les configurations Kubernetes sont disponibles dans le dossier k8s/ :

bash
# Appliquer les configurations
kubectl apply -f k8s/

# Vérifier l'état des pods
kubectl get pods --all-namespaces
Variables d'Environnement
Chaque service nécessite une configuration via variables d'environnement. Consultez les fichiers .env.example ou application.properties dans chaque répertoire de service.

📂 Structure du Projet (Détail)
text
.
├── docker-compose.yml
├── eureka_register.json
├── frontend
│   ├── dist
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── public
│   ├── README.md
│   ├── src
│   ├── tailwind.config.js
│   └── vite.config.js
├── k8s
│   ├── configs
│   ├── databases
│   ├── ingress
│   ├── kustomization-dev.yaml
│   ├── kustomization-prod.yaml
│   ├── kustomization.yaml
│   ├── namespaces
│   ├── README.md
│   ├── scripts
│   └── services
├── node_modules
│   ├── acorn
│   ├── @alloc
│   ├── asynckit
│   ├── autoprefixer
│   ├── axios
│   ├── baseline-browser-mapping
│   ├── browserslist
│   ├── buffer-from
│   ├── call-bind-apply-helpers
│   ├── caniuse-lite
│   ├── chart.js
│   ├── clsx
│   ├── combined-stream
│   ├── commander
│   ├── cookie
│   ├── cssesc
│   ├── date-fns
│   ├── debug
│   ├── delayed-stream
│   ├── detect-libc
│   ├── dunder-proto
│   ├── electron-to-chromium
│   ├── engine.io-client
│   ├── engine.io-parser
│   ├── enhanced-resolve
│   ├── @esbuild
│   ├── esbuild
│   ├── escalade
│   ├── es-define-property
│   ├── es-errors
│   ├── es-object-atoms
│   ├── es-set-tostringtag
│   ├── @floating-ui
│   ├── follow-redirects
│   ├── form-data
│   ├── fraction.js
│   ├── function-bind
│   ├── get-intrinsic
│   ├── get-proto
│   ├── gopd
│   ├── graceful-fs
│   ├── hasown
│   ├── has-symbols
│   ├── has-tostringtag
│   ├── @headlessui
│   ├── @heroicons
│   ├── @hookform
│   ├── jiti
│   ├── @jridgewell
│   ├── @kurkle
│   ├── leaflet
│   ├── lightningcss
│   ├── lightningcss-linux-x64-gnu
│   ├── lucide-react
│   ├── magic-string
│   ├── math-intrinsics
│   ├── mime-db
│   ├── mime-types
│   ├── mini-svg-data-uri
│   ├── ms
│   ├── nanoid
│   ├── node-releases
│   ├── normalize-range
│   ├── picocolors
│   ├── postcss
│   ├── postcss-selector-parser
│   ├── postcss-value-parser
│   ├── property-expr
│   ├── proxy-from-env
│   ├── react
│   ├── @react-aria
│   ├── react-chartjs-2
│   ├── react-dom
│   ├── react-hook-form
│   ├── @react-leaflet
│   ├── react-leaflet
│   ├── react-router
│   ├── react-router-dom
│   ├── @react-stately
│   ├── @react-types
│   ├── scheduler
│   ├── set-cookie-parser
│   ├── @socket.io
│   ├── socket.io-client
│   ├── socket.io-parser
│   ├── source-map
│   ├── source-map-js
│   ├── source-map-support
│   ├── @standard-schema
│   ├── @swc
│   ├── tabbable
│   ├── @tailwindcss
│   ├── tailwindcss
│   ├── @tanstack
│   ├── tapable
│   ├── terser
│   ├── tiny-case
│   ├── toposort
│   ├── tslib
│   ├── type-fest
│   ├── update-browserslist-db
│   ├── use-sync-external-store
│   ├── util-deprecate
│   ├── ws
│   ├── xmlhttprequest-ssl
│   └── yup
├── package.json
├── package-lock.json
├── README.md
├── start-all.sh
├── terra-auth-service
│   ├── auth_app
│   ├── auth_service
│   ├── Dockerfile
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── venv
├── terra-cloud-conf
│   ├── application.properties
│   ├── README.md
│   ├── terra-auth-service.properties
│   ├── terra-notification-service.properties
│   ├── terra-order-transaction-service-dev.json
│   ├── terra-order-transcation-service.properties
│   ├── terra-product-service.properties
│   ├── terra-proxy-service.properties
│   ├── terra-registry-service.properties
│   └── terra-users-service.properties
├── terra-conf-service
│   ├── Dockerfile
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src
│   └── target
├── terra-notification-service
│   ├── Dockerfile
│   ├── node
│   ├── node_modules
│   ├── notification_service@1.0.0
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── scripts
│   └── src
├── terra-order-transaction-service
│   ├── cleanup_drf_yasg.py
│   ├── config
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── gunicorn.conf.py
│   ├── htmlcov
│   ├── logs
│   ├── manage.py
│   ├── order_app
│   ├── pytest.ini
│   ├── rabbitmq
│   ├── requirements.txt
│   ├── run_tests.sh
│   ├── schema.yml
│   ├── terra_orders
│   ├── test_config_service.py
│   ├── test_rabbitmq.py
│   └── venv
├── terra-product-service
│   ├── Dockerfile
│   ├── manage.py
│   ├── product_app
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── terra_product_service
│   └── venv
├── terra-proxy-service
│   ├── Dockerfile
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src
│   └── target
├── terra-registry-service
│   ├── Dockerfile
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src
│   └── target
├── terra-users-service
│   └── user_service
├── Untitled
└── venv
    ├── bin
    ├── include
    ├── lib
    ├── lib64 -> lib
    └── pyvenv.cfg



🔧 Développement
Pour contribuer à un service Python :
bash
cd terra-auth-service  # ou autre service
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
Pour développer le frontend :
bash
cd frontend
npm install
npm run dev
🤝 Contributions
Les contributions sont les bienvenues ! Pour contribuer :

Forkez le projet

Créez une branche pour votre fonctionnalité (git checkout -b feature/ma-fonctionnalite)

Committez vos changements (git commit -m 'Ajout de ma fonctionnalité')

Push vers la branche (git push origin feature/ma-fonctionnalite)

Ouvrez une Pull Request

📄 Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

📞 Support
Pour toute question ou problème :

Consultez les README individuels dans chaque service

Ouvrez une issue sur GitHub

Contactez l'équipe de développement

État du projet : 🟢 Actif - Dernière mise à jour : Décembre 2025

