# generate_hashes.py
from django.contrib.auth.hashers import make_password
import uuid

print("=== SQL INSERTS avec vrais hashs ===")
print()

users = [
    {'email': 'admin@terrabia.com', 'pwd': 'Admin123!', 'name': 'Admin System', 'role': 'admin', 'phone': '+237690000001', 'location': 'Yaounde', 'staff': 1, 'super': 1},
    {'email': 'acheteur@test.com', 'pwd': 'Acheteur123!', 'name': 'Acheteur Test', 'role': 'acheteur', 'phone': '+237690000002', 'location': 'Douala', 'staff': 0, 'super': 0},
    {'email': 'vendeur@ferme.com', 'pwd': 'Vendeur123!', 'name': 'Vendeur Agricole', 'role': 'vendeur', 'phone': '+237690000003', 'location': 'Bafoussam', 'staff': 0, 'super': 0},
    {'email': 'livreur@transport.com', 'pwd': 'Livreur123!', 'name': 'Livreur Express', 'role': 'livreur', 'phone': '+237690000004', 'location': 'Yaounde', 'staff': 0, 'super': 0}
]

for user in users:
    hash_value = make_password(user['pwd'])
    user_id = uuid.uuid4().hex
    
    print(f"-- {user['role'].upper()}: {user['email']}")
    print(f"INSERT INTO auth_schema_users (")
    print(f"    id, email, password, role, created_at, updated_at, is_active,")
    print(f"    full_name, is_staff, is_superuser, last_login, location, phone")
    print(f") VALUES (")
    print(f"    '{user_id}',")
    print(f"    '{user['email']}',")
    print(f"    '{hash_value}',")
    print(f"    '{user['role']}',")
    print(f"    NOW(), NOW(), 1,")
    print(f"    '{user['name']}', {user['staff']}, {user['super']}, NULL,")
    print(f"    '{user['location']}', '{user['phone']}'")
    print(f");")
    print()