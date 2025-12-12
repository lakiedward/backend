# 🔐 API Admin Documentation - Piața din Dumbravița

**Base URL:** `https://piata-dumbravita-api-production.up.railway.app`

---

## � Cuprins

1. [Cont Admin](#-cont-admin)
2. [Login Admin](#-login-admin)
3. [Dashboard Stats](#-dashboard-stats)
4. [Users Management](#-users-management)
5. [Shops Management](#-shops-management)
6. [Producers Management](#-producers-management)
7. [Products Management](#-products-management)

---

## �👤 Cont Admin

| Câmp | Valoare |
|------|---------|
| **Email** | `admin@test.com` |
| **Parolă** | `12345678` |
| **Role** | `admin` |

---

## 🔑 Login Admin

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@test.com",
  "password": "12345678"
}
```

**✅ Response (200):**
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

## � Dashboard Stats

**Endpoint:** `GET /api/admin/stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**✅ Response (200):**
```json
{
  "stats": {
    "users": 9,
    "shops": 2,
    "products": 3,
    "producers": 4
  }
}
```

---

## 👥 Users Management

### GET All Users

**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**✅ Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Ion Popescu",
      "phone": "0712345678",
      "role": "user",
      "created_at": "2025-12-12T14:00:00.000Z",
      "updated_at": "2025-12-12T14:00:00.000Z"
    }
  ]
}
```

---

### GET User by ID

**Endpoint:** `GET /api/admin/users/:id`

**✅ Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Ion Popescu",
    "phone": "0712345678",
    "role": "user",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "User not found"}` |

---

### PUT Update User

**Endpoint:** `PUT /api/admin/users/:id`

**Body:**
```json
{
  "email": "newemail@example.com",
  "full_name": "Nume Nou",
  "phone": "0799999999",
  "role": "producer"
}
```

**✅ Response (200):**
```json
{
  "message": "User updated successfully",
  "user": { ... }
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "User not found"}` |
| 500 | `{"error": "Failed to update user"}` |

---

### DELETE User

**Endpoint:** `DELETE /api/admin/users/:id`

**✅ Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 400 | `{"error": "Cannot delete your own account"}` |
| 404 | `{"error": "User not found"}` |
| 500 | `{"error": "Failed to delete user"}` |

---

## 🏪 Shops Management

### GET All Shops (Admin)

**Endpoint:** `GET /api/admin/shops`

**✅ Response (200):**
```json
{
  "shops": [
    {
      "id": 1,
      "user_id": 2,
      "name": "Ferma Bunicii",
      "specialty": "Legume Bio",
      "description": "...",
      "location": "...",
      "image_url": "...",
      "is_active": true,
      "created_at": "...",
      "updated_at": "...",
      "owner_name": "Maria Ionescu",
      "owner_email": "maria@example.com",
      "product_count": "5"
    }
  ]
}
```

---

### PUT Update Shop

**Endpoint:** `PUT /api/admin/shops/:id`

**Body:**
```json
{
  "name": "Nume Nou",
  "specialty": "Specialitate Nouă",
  "description": "Descriere nouă",
  "location": "Locație nouă",
  "image_url": "https://...",
  "is_active": false
}
```

**✅ Response (200):**
```json
{
  "message": "Shop updated successfully",
  "shop": { ... }
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "Shop not found"}` |
| 500 | `{"error": "Failed to update shop"}` |

---

### DELETE Shop

**Endpoint:** `DELETE /api/admin/shops/:id`

**✅ Response (200):**
```json
{
  "message": "Shop deleted successfully"
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "Shop not found"}` |
| 500 | `{"error": "Failed to delete shop"}` |

---

## 🌾 Producers Management

### GET All Producers

**Endpoint:** `GET /api/admin/producers`

**✅ Response (200):**
```json
{
  "producers": [
    {
      "id": 1,
      "user_id": 2,
      "name": "Ferma Verde",
      "description": "...",
      "location": "...",
      "phone": "0712345678",
      "email": "ferma@example.com",
      "image_url": "...",
      "created_at": "...",
      "user_email": "owner@example.com",
      "user_name": "Ion Popescu"
    }
  ]
}
```

---

### PUT Update Producer

**Endpoint:** `PUT /api/admin/producers/:id`

**Body:**
```json
{
  "name": "Nume Nou",
  "description": "Descriere nouă",
  "location": "Locație nouă",
  "phone": "0799999999",
  "email": "newemail@example.com",
  "image_url": "https://..."
}
```

**✅ Response (200):**
```json
{
  "message": "Producer updated successfully",
  "producer": { ... }
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "Producer not found"}` |
| 500 | `{"error": "Failed to update producer"}` |

---

### DELETE Producer

**Endpoint:** `DELETE /api/admin/producers/:id`

**✅ Response (200):**
```json
{
  "message": "Producer deleted successfully"
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "Producer not found"}` |
| 500 | `{"error": "Failed to delete producer"}` |

---

## 📦 Products Management

### GET All Products

**Endpoint:** `GET /api/admin/products`

**✅ Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "shop_id": 1,
      "name": "Roșii Cherry",
      "description": "...",
      "price": "15.50",
      "image_url": "...",
      "is_available": true,
      "created_at": "...",
      "updated_at": "...",
      "shop_name": "Ferma Bunicii",
      "owner_name": "Maria Ionescu"
    }
  ]
}
```

---

### PUT Update Product

**Endpoint:** `PUT /api/admin/products/:id`

**Body:**
```json
{
  "name": "Nume Nou",
  "description": "Descriere nouă",
  "price": 20.00,
  "image_url": "https://...",
  "is_available": false
}
```

**✅ Response (200):**
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "Product not found"}` |
| 500 | `{"error": "Failed to update product"}` |

---

### DELETE Product

**Endpoint:** `DELETE /api/admin/products/:id`

**✅ Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**❌ Errors:**
| Status | Response |
|--------|----------|
| 404 | `{"error": "Product not found"}` |
| 500 | `{"error": "Failed to delete product"}` |

---

## 🔒 Erori Comune pentru toate endpointurile Admin

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 403 | Nu e admin | `{"error": "Admin access required"}` |
| 403 | Token invalid | `{"error": "Invalid or expired token"}` |

---

## 📝 Exemplu JavaScript - API Admin

```javascript
const API_URL = 'https://piata-dumbravita-api-production.up.railway.app';

// Helper pentru requests admin
const adminRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
};

// Exemple
const getStats = () => adminRequest('/api/admin/stats');
const getUsers = () => adminRequest('/api/admin/users');
const getShops = () => adminRequest('/api/admin/shops');
const getProducers = () => adminRequest('/api/admin/producers');
const getProducts = () => adminRequest('/api/admin/products');

const updateUser = (id, data) => adminRequest(`/api/admin/users/${id}`, 'PUT', data);
const deleteUser = (id) => adminRequest(`/api/admin/users/${id}`, 'DELETE');

const updateShop = (id, data) => adminRequest(`/api/admin/shops/${id}`, 'PUT', data);
const deleteShop = (id) => adminRequest(`/api/admin/shops/${id}`, 'DELETE');

const updateProducer = (id, data) => adminRequest(`/api/admin/producers/${id}`, 'PUT', data);
const deleteProducer = (id) => adminRequest(`/api/admin/producers/${id}`, 'DELETE');

const updateProduct = (id, data) => adminRequest(`/api/admin/products/${id}`, 'PUT', data);
const deleteProduct = (id) => adminRequest(`/api/admin/products/${id}`, 'DELETE');
```

---

## 📊 Rezumat Endpointuri Admin

| Endpoint | Metodă | Descriere |
|----------|--------|-----------|
| `/api/admin/stats` | GET | Dashboard statistici |
| `/api/admin/users` | GET | Lista toți userii |
| `/api/admin/users/:id` | GET | User după ID |
| `/api/admin/users/:id` | PUT | Editează user |
| `/api/admin/users/:id` | DELETE | Șterge user |
| `/api/admin/shops` | GET | Lista toate shops |
| `/api/admin/shops/:id` | PUT | Editează shop |
| `/api/admin/shops/:id` | DELETE | Șterge shop |
| `/api/admin/producers` | GET | Lista toți producătorii |
| `/api/admin/producers/:id` | PUT | Editează producător |
| `/api/admin/producers/:id` | DELETE | Șterge producător |
| `/api/admin/products` | GET | Lista toate produsele |
| `/api/admin/products/:id` | PUT | Editează produs |
| `/api/admin/products/:id` | DELETE | Șterge produs |

---

**Ultima actualizare:** 12 Decembrie 2025
