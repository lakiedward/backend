# 🔐 API Admin Documentation - Piața din Dumbravița

**Base URL:** `https://piata-dumbravita-api-production.up.railway.app`

---

## 👤 Cont Admin

| Câmp | Valoare |
|------|---------|
| **Email** | `admin@test.com` |
| **Parolă** | `12345678` |
| **Role** | `admin` |

---

## 🔑 Login Admin

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@test.com",
  "password": "12345678"
}
```

**✅ Response Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 9,
    "email": "admin@test.com",
    "fullName": "Administrator",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 📝 Exemplu JavaScript - Login Admin

```javascript
const loginAdmin = async () => {
  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: '12345678'
    })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('Admin logged in:', data.user);
  }
  
  return data;
};
```

---

## 🔍 Verificare Rol Admin

După login, verificați că `user.role === 'admin'`:

```javascript
const checkIsAdmin = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  return data.user.role === 'admin';
};
```

---

## 🛡️ Permisiuni Admin

Contul admin are acces la toate operațiunile:

| Acțiune | Permis |
|---------|--------|
| Vizualizare toate shops | ✅ |
| Vizualizare toți users | ✅ |
| Editare orice shop | ✅ |
| Ștergere orice shop | ✅ |
| Editare orice produs | ✅ |
| Ștergere orice produs | ✅ |

---

## ⚠️ Notă de Securitate

Acest cont admin este pentru **testare și dezvoltare**.
În producție, ar trebui:
- Schimbată parola
- Adăugate endpointuri dedicate pentru admin
- Implementat un sistem de permisiuni mai complex

---

## 📊 Identificare Role în Sistem

| Role | Descriere |
|------|-----------|
| `user` | Utilizator simplu (doar vizualizare) |
| `producer` | Producător (poate crea/edita propriile shops și products) |
| `admin` | Administrator (acces total) |

---

**Ultima actualizare:** 12 Decembrie 2025
