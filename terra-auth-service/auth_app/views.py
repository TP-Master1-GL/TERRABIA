# auth_app/views.py
from django.http import JsonResponse
from rest_framework.views import APIView
from django.utils import timezone
from .models import User, RefreshToken, BlacklistToken
import jwt
import uuid
from datetime import timedelta
from .config import get_config
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# === Schémas Swagger ===
login_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Email de l\'utilisateur'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='Mot de passe en clair'),
    },
    required=['email', 'password']
)

token_response = openapi.Response(
    description="Tokens JWT",
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'accessToken': openapi.Schema(type=openapi.TYPE_STRING, description='Token d\'accès (15min)'),
            'refreshToken': openapi.Schema(type=openapi.TYPE_STRING, description='Token de rafraîchissement (7j)'),
        }
    )
)

register_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Email de l\'utilisateur'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='Mot de passe'),
        'full_name': openapi.Schema(type=openapi.TYPE_STRING, description='Nom complet'),
        'role': openapi.Schema(
            type=openapi.TYPE_STRING, 
            description='Rôle: acheteur, vendeur, admin, livreur',
            enum=['acheteur', 'vendeur', 'admin', 'livreur']
        ),
        'phone': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone'),
        'location': openapi.Schema(type=openapi.TYPE_STRING, description='Localisation'),
    },
    required=['email', 'password']
)


class LoginView(APIView):
    @swagger_auto_schema(
        request_body=login_request,
        responses={
            200: token_response,
            400: "Champs requis manquants",
            401: "Identifiants invalides",
            403: "Utilisateur inactif"
        },
        operation_summary="Connexion utilisateur",
        operation_description="Retourne un accessToken et refreshToken JWT"
    )
    def post(self, request):
        config = get_config()

        email = request.data.get("email")
        password = request.data.get("password")

        # Vérifie les champs obligatoires
        if not email or not password:
            return JsonResponse({"error": "Champs requis manquants"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "Identifiants invalides"}, status=401)

        # Vérifie si l'utilisateur est actif
        if not user.is_active:
            return JsonResponse({"error": "Utilisateur inactif"}, status=403)

        # Vérification du mot de passe avec Django (plus besoin de bcrypt)
        if not user.check_password(password):
            return JsonResponse({"error": "Identifiants invalides"}, status=401)

        # Génération du token d'accès
        payload = {
            "user_id": str(user.id),
            "role": user.role,
            "exp": timezone.now() + timedelta(seconds=int(config.get("auth.jwt_expiration", 900)))
        }
        access_token = jwt.encode(payload, config.get("auth.jwt_secret", "secret"), algorithm="HS256")

        # Génération du refresh token
        refresh_token = str(uuid.uuid4())
        RefreshToken.objects.create(
            token=refresh_token,
            user=user,
            expiration=timezone.now() + timedelta(days=int(config.get("auth.refresh_expiration", 7)))
        )

        return JsonResponse({
            "accessToken": access_token,
            "refreshToken": refresh_token
        })


class RegisterView(APIView):
    @swagger_auto_schema(
        request_body=register_request,
        responses={
            201: openapi.Response("Utilisateur créé", openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'accessToken': openapi.Schema(type=openapi.TYPE_STRING),
                    'refreshToken': openapi.Schema(type=openapi.TYPE_STRING),
                    'user': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(type=openapi.TYPE_STRING),
                            'email': openapi.Schema(type=openapi.TYPE_STRING),
                            'role': openapi.Schema(type=openapi.TYPE_STRING),
                            'full_name': openapi.Schema(type=openapi.TYPE_STRING),
                        }
                    )
                }
            )),
            400: "Données invalides",
            409: "Email déjà utilisé",
            500: "Erreur interne du serveur"
        },
        operation_summary="Inscription utilisateur",
        operation_description="Crée un nouvel utilisateur et retourne les tokens JWT"
    )
    def post(self, request):
        config = get_config()
        
        # Récupération des données
        email = request.data.get("email")
        password = request.data.get("password")
        full_name = request.data.get("full_name", "")
        role = request.data.get("role", "acheteur")
        phone = request.data.get("phone", "")
        location = request.data.get("location", "")

        # Validation basique
        if not email or not password:
            return JsonResponse({"error": "Email et mot de passe requis"}, status=400)

        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Cet email est déjà utilisé"}, status=409)

        # Validation du rôle
        valid_roles = ['acheteur', 'vendeur', 'admin', 'livreur']
        if role not in valid_roles:
            return JsonResponse({"error": f"Rôle invalide. Doit être l'un de: {', '.join(valid_roles)}"}, status=400)

        try:
            # Créer l'utilisateur avec UserManager (qui utilise set_password automatiquement)
            user = User.objects.create_user(
                email=email,
                password=password,  # Django hash automatiquement
                full_name=full_name,
                role=role,
                phone=phone,
                location=location,
                is_active=True
            )

            # Génération du token d'accès
            payload = {
                "user_id": str(user.id),
                "role": user.role,
                "exp": timezone.now() + timedelta(seconds=int(config.get("auth.jwt_expiration", 900)))
            }
            access_token = jwt.encode(payload, config.get("auth.jwt_secret", "secret"), algorithm="HS256")

            # Génération du refresh token
            refresh_token = str(uuid.uuid4())
            RefreshToken.objects.create(
                token=refresh_token,
                user=user,
                expiration=timezone.now() + timedelta(days=int(config.get("auth.refresh_expiration", 7)))
            )

            # Publier l'événement RabbitMQ (si configuré)
            try:
                from .rabbitmq_publisher import publish_user_created
                publish_user_created({
                    "user_id": str(user.id),
                    "email": email,
                    "full_name": full_name,
                    "role": role,
                    "phone": phone,
                    "location": location,
                    "created_at": user.created_at.isoformat()
                })
            except ImportError:
                # RabbitMQ n'est pas configuré, c'est OK pour le MVP
                pass
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Erreur RabbitMQ (non bloquante): {e}")

            return JsonResponse({
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "role": user.role,
                    "full_name": user.full_name
                }
            }, status=201)

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de l'inscription: {str(e)}")
            return JsonResponse({"error": "Erreur interne du serveur"}, status=500)


class RefreshView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refreshToken': openapi.Schema(type=openapi.TYPE_STRING, description='Token de rafraîchissement')
            },
            required=['refreshToken']
        ),
        responses={
            200: openapi.Response("Nouveau accessToken", openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={'accessToken': openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            401: "Token invalide"
        },
        operation_summary="Rafraîchir le token",
        operation_description="Génère un nouveau accessToken à partir du refreshToken"
    )
    def post(self, request):
        refresh_token_str = request.data.get("refreshToken")
        if not refresh_token_str:
            return JsonResponse({"error": "Refresh token manquant"}, status=400)

        # Vérification blacklist
        if BlacklistToken.objects.filter(token=refresh_token_str).exists():
            return JsonResponse({"error": "Token invalide ou blacklisté"}, status=401)

        rt = RefreshToken.objects.filter(token=refresh_token_str).first()
        if not rt or rt.is_expired():
            return JsonResponse({"error": "Token invalide ou expiré"}, status=401)

        user = rt.user
        config = get_config()
        payload = {
            "user_id": str(user.id),
            "role": user.role,
            "exp": timezone.now() + timedelta(seconds=int(config.get("auth.jwt_expiration", 900)))
        }
        access_token = jwt.encode(payload, config.get("auth.jwt_secret", "secret"), algorithm="HS256")

        return JsonResponse({"accessToken": access_token})


class ValidateView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer <accessToken>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response("Token valide", openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'valide': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'user_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'role': openapi.Schema(type=openapi.TYPE_STRING, enum=['acheteur', 'vendeur', 'admin', 'livreur'])
                }
            )),
            401: "Token invalide"
        },
        operation_summary="Valider un token",
        operation_description="Vérifie si le token JWT est valide"
    )
    def get(self, request):
        config = get_config()
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, config.get("auth.jwt_secret", "secret"), algorithms=["HS256"])
            if BlacklistToken.objects.filter(token=token).exists():
                return JsonResponse({"valide": False, "error": "Token blacklisté"}, status=401)
            return JsonResponse({"valide": True, "user_id": payload["user_id"], "role": payload["role"]})
        except jwt.ExpiredSignatureError:
            return JsonResponse({"valide": False, "error": "Token expiré"}, status=401)
        except Exception:
            return JsonResponse({"valide": False, "error": "Token invalide"}, status=401)


class LogoutView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer <accessToken>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: "Déconnexion réussie",
            401: "Token invalide"
        },
        operation_summary="Déconnexion",
        operation_description="Invalide le token et supprime le refresh token"
    )
    def post(self, request):
        config = get_config()
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, config.get("auth.jwt_secret", "secret"), algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expiré"}, status=401)
        except Exception:
            return JsonResponse({"error": "Token invalide"}, status=401)

        # Vérifier si le token est déjà blacklisté
        if BlacklistToken.objects.filter(token=token).exists():
            return JsonResponse({"message": "Token déjà invalidé"}, status=200)

        # Ajouter le token à la blacklist
        BlacklistToken.objects.create(
            token=token,
            expiration=timezone.now() + timedelta(seconds=int(config.get("auth.jwt_expiration", 900)))
        )
        
        # Supprimer tous les refresh tokens associés
        RefreshToken.objects.filter(user__id=payload["user_id"]).delete()

        return JsonResponse({"message": "Déconnexion réussie"})