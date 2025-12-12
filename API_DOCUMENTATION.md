# 📚 API Documentation - Piața din Dumbravița Backend

**Base URL:** `https://piata-dumbravita-api-production.up.railway.app`

**Versiune:** 2.0 (cu Shops & Products)

---

## 📋 Cuprins

1. [Autentificare](#-autentificare)
2. [Users](#-users)
3. [Shops (Buticuri)](#-shops-buticuri)
4. [Products (Produse)](#-products-produse)
5. [Upload (Imagini)](#-upload-imagini)
6. [Producers (Legacy)](#-producers-legacy)
7. [Health Check](#-health-check)
8. [Coduri de Eroare](#-coduri-de-eroare)
9. [Exemple JavaScript](#-exemple-javascript)

---

## 🔐 Autentificare

### 1. Înregistrare User Normal

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "parola123",
  "fullName": "Ion Popescu"
}
```

**Câmpuri obligatorii:** `email`, `password` (min 8 caractere), `fullName`

**✅ Response Success (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Ion Popescu",
    "role": "user"
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | User deja există | `{"error": "User already exists"}` |
| 500 | Eroare server | `{"error": "Registration failed"}` |

---

### 2. Înregistrare Producător

**Endpoint:** `POST /api/auth/register/producer`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "producator@example.com",
  "password": "parola123",
  "fullName": "Maria Ionescu",
  "phone": "0723456789",
  "specialty": "Legume Bio",
  "location": "Strada Fermei nr. 5, Dumbrăvița",
  "description": "Legume proaspete cultivate organic."
}
```

**Câmpuri obligatorii:** `email`, `password` (min 8 caractere), `fullName`
**Câmpuri opționale:** `phone`, `specialty`, `location`, `description`

**✅ Response Success (201):**
```json
{
  "message": "Producer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "producator@example.com",
    "fullName": "Maria Ionescu",
    "phone": "0723456789",
    "role": "producer",
    "shop": {
      "id": 1,
      "user_id": 2,
      "name": "Maria Ionescu",
      "specialty": "Legume Bio",
      "description": "Legume proaspete cultivate organic.",
      "location": "Strada Fermei nr. 5, Dumbrăvița",
      "image_url": null,
      "is_active": true,
      "created_at": "2025-12-12T14:13:23.727Z",
      "updated_at": "2025-12-12T14:13:23.727Z"
    }
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Validare eșuată | `{"error": "Validation failed", "details": [{"field": "email", "message": "Email is required"}]}` |
| 400 | Parolă prea scurtă | `{"error": "Validation failed", "details": [{"field": "password", "message": "Password must be at least 8 characters"}]}` |
| 409 | Email deja există | `{"error": "Email already registered"}` |
| 500 | Eroare server | `{"error": "Registration failed"}` |

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "parola123"
}
```

**✅ Response Success (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Ion Popescu",
    "role": "user"
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Credențiale invalide | `{"error": "Invalid credentials"}` |
| 500 | Eroare server | `{"error": "Login failed"}` |

---

### 4. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**✅ Response Success (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Ion Popescu",
    "full_name": "Ion Popescu",
    "phone": "0712345678",
    "role": "producer",
    "createdAt": "2025-12-11T17:28:00.000Z",
    "shops": [
      {
        "id": 1,
        "user_id": 1,
        "name": "Ferma Bunicii",
        "specialty": "Legume Bio",
        "description": "...",
        "location": "...",
        "image_url": null,
        "is_active": true,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 403 | Token invalid/expirat | `{"error": "Invalid or expired token"}` |
| 404 | User nu există | `{"error": "User not found"}` |
| 500 | Eroare server | `{"error": "Failed to get profile"}` |

---

## 👤 Users

### 5. Update User Profile (Protected)

**Endpoint:** `PUT /api/users/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fullName": "Ion Popescu Updated",
  "phone": "0799999999"
}
```

**✅ Response Success (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Ion Popescu Updated",
    "phone": "0799999999",
    "role": "user"
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 403 | Nu e contul tău | `{"error": "Access denied"}` |
| 404 | User nu există | `{"error": "User not found"}` |
| 500 | Eroare server | `{"error": "Failed to update user"}` |

---

### 6. Change Password (Protected)

**Endpoint:** `PUT /api/users/password/change`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "parola123",
  "newPassword": "parolanoua456"
}
```

**✅ Response Success (200):**
```json
{
  "message": "Password changed successfully"
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Validare eșuată | `{"error": "Validation failed", "details": [{"field": "currentPassword", "message": "Current password is required"}]}` |
| 400 | Parolă nouă prea scurtă | `{"error": "Validation failed", "details": [{"field": "newPassword", "message": "New password must be at least 8 characters"}]}` |
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 401 | Parolă curentă greșită | `{"error": "Current password is incorrect"}` |
| 404 | User nu există | `{"error": "User not found"}` |
| 500 | Eroare server | `{"error": "Failed to change password"}` |

---

## 🏪 Shops (Buticuri)

### 7. Get All Shops (Public)

**Endpoint:** `GET /api/shops`

**✅ Response Success (200):**
```json
{
  "shops": [
    {
      "id": 1,
      "user_id": 2,
      "name": "Ferma Bunicii",
      "specialty": "Legume Bio",
      "description": "Legume proaspete...",
      "location": "Strada Principală 10",
      "image_url": "https://...",
      "is_active": true,
      "created_at": "2025-12-12T14:13:23.727Z",
      "updated_at": "2025-12-12T14:13:23.727Z",
      "owner_name": "Maria Ionescu",
      "owner_email": "maria@example.com",
      "product_count": "5"
    }
  ]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 500 | Eroare server | `{"error": "Failed to fetch shops"}` |

---

### 8. Get Shop by ID (Public)

**Endpoint:** `GET /api/shops/:id`

**✅ Response Success (200):**
```json
{
  "shop": {
    "id": 1,
    "user_id": 2,
    "name": "Ferma Bunicii",
    "specialty": "Legume Bio",
    "description": "...",
    "location": "...",
    "image_url": null,
    "is_active": true,
    "created_at": "...",
    "updated_at": "...",
    "owner_name": "Maria Ionescu",
    "owner_email": "maria@example.com",
    "owner_phone": "0723456789"
  },
  "products": [
    {
      "id": 1,
      "shop_id": 1,
      "name": "Roșii Cherry",
      "description": "Roșii mici și dulci",
      "price": "15.50",
      "image_url": null,
      "is_available": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 404 | Shop nu există | `{"error": "Shop not found"}` |
| 500 | Eroare server | `{"error": "Failed to fetch shop"}` |

---

### 9. Get My Shops (Protected)

**Endpoint:** `GET /api/shops/my/all`

**Headers:**
```
Authorization: Bearer <token>
```

**✅ Response Success (200):**
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
      "image_url": null,
      "is_active": true,
      "created_at": "...",
      "updated_at": "...",
      "products": [
        {
          "id": 1,
          "shop_id": 1,
          "name": "Roșii",
          "price": "15.50",
          "..."
        }
      ]
    }
  ]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 500 | Eroare server | `{"error": "Failed to fetch your shops"}` |

---

### 10. Get Shops by User ID (Public)

**Endpoint:** `GET /api/shops/user/:userId`

**✅ Response Success (200):**
```json
{
  "shops": [
    {
      "id": 1,
      "user_id": 2,
      "name": "Ferma Bunicii",
      "specialty": "Legume Bio",
      "product_count": "5",
      "..."
    }
  ]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 500 | Eroare server | `{"error": "Failed to fetch user shops"}` |

---

### 11. Create Shop (Protected)

**Endpoint:** `POST /api/shops`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Al Doilea Butic",
  "specialty": "Fructe",
  "description": "Fructe proaspete de sezon",
  "location": "Strada Nouă 5",
  "image_url": "https://example.com/image.jpg"
}
```

**Câmpuri obligatorii:** `name`
**Câmpuri opționale:** `specialty`, `description`, `location`, `image_url`

**✅ Response Success (201):**
```json
{
  "message": "Shop created successfully",
  "shop": {
    "id": 2,
    "user_id": 2,
    "name": "Al Doilea Butic",
    "specialty": "Fructe",
    "description": "Fructe proaspete de sezon",
    "location": "Strada Nouă 5",
    "image_url": "https://example.com/image.jpg",
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Nume lipsă | `{"error": "Shop name is required"}` |
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 500 | Eroare server | `{"error": "Failed to create shop"}` |

---

### 12. Update Shop (Protected)

**Endpoint:** `PUT /api/shops/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Ferma Actualizată",
  "specialty": "Legume Organice",
  "description": "Descriere nouă",
  "location": "Adresă nouă",
  "image_url": "https://...",
  "is_active": true
}
```

**✅ Response Success (200):**
```json
{
  "message": "Shop updated successfully",
  "shop": {
    "id": 1,
    "user_id": 2,
    "name": "Ferma Actualizată",
    "specialty": "Legume Organice",
    "..."
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 404 | Shop nu există sau nu e al tău | `{"error": "Shop not found or unauthorized"}` |
| 500 | Eroare server | `{"error": "Failed to update shop"}` |

---

### 13. Delete Shop (Protected)

**Endpoint:** `DELETE /api/shops/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**✅ Response Success (200):**
```json
{
  "message": "Shop deleted successfully"
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 404 | Shop nu există sau nu e al tău | `{"error": "Shop not found or unauthorized"}` |
| 500 | Eroare server | `{"error": "Failed to delete shop"}` |

---

## 📦 Products (Produse)

> **Notă:** Coloana `price` este de tip `DECIMAL(10,2)`. Acceptă valori cu virgulă (`15,50`) sau punct (`15.50`).

### 14. Get Products by Shop (Public)

**Endpoint:** `GET /api/products/shop/:shopId`

**✅ Response Success (200):**
```json
{
  "products": [
    {
      "id": 1,
      "shop_id": 1,
      "name": "Roșii Cherry",
      "description": "Roșii mici și dulci",
      "price": "15.50",
      "image_url": null,
      "is_available": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 500 | Eroare server | `{"error": "Failed to fetch products"}` |

---

### 15. Get Product by ID (Public)

**Endpoint:** `GET /api/products/:id`

**✅ Response Success (200):**
```json
{
  "product": {
    "id": 1,
    "shop_id": 1,
    "name": "Roșii Cherry",
    "description": "Roșii mici și dulci",
    "price": "15.50",
    "image_url": null,
    "is_available": true,
    "created_at": "...",
    "updated_at": "...",
    "shop_name": "Ferma Bunicii",
    "owner_id": 2
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 404 | Produs nu există | `{"error": "Product not found"}` |
| 500 | Eroare server | `{"error": "Failed to fetch product"}` |

---

### 16. Create Product (Protected)

**Endpoint:** `POST /api/products/shop/:shopId`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Roșii Cherry",
  "description": "Roșii mici și dulci",
  "price": 15.50,
  "image_url": "https://..."
}
```

**Câmpuri obligatorii:** `name`
**Câmpuri opționale:** `description`, `price`, `image_url`

**Formate acceptate pentru `price`:**
- `15.50` (număr)
- `"15.50"` (string cu punct)
- `"15,50"` (string cu virgulă)

**✅ Response Success (201):**
```json
{
  "message": "Product added successfully",
  "product": {
    "id": 1,
    "shop_id": 1,
    "name": "Roșii Cherry",
    "description": "Roșii mici și dulci",
    "price": "15.50",
    "image_url": "https://...",
    "is_available": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Nume lipsă | `{"error": "Product name is required"}` |
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 403 | Shop nu e al tău | `{"error": "You can only add products to your own shops"}` |
| 500 | Eroare server | `{"error": "Failed to create product"}` |

---

### 17. Create Products Bulk (Protected)

**Endpoint:** `POST /api/products/shop/:shopId/bulk`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "products": [
    {"name": "Roșii", "price": 12.00},
    {"name": "Castraveți", "price": 8.50},
    {"name": "Ardei", "price": 10.00}
  ]
}
```

**✅ Response Success (201):**
```json
{
  "message": "3 products added successfully",
  "products": [...]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Array lipsă | `{"error": "Products array is required"}` |
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 403 | Shop nu e al tău | `{"error": "You can only add products to your own shops"}` |
| 500 | Eroare server | `{"error": "Failed to create products"}` |

---

### 18. Update Product (Protected)

**Endpoint:** `PUT /api/products/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Roșii Cherry Premium",
  "description": "Descriere actualizată",
  "price": 18.00,
  "image_url": "https://...",
  "is_available": true
}
```

**✅ Response Success (200):**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "shop_id": 1,
    "name": "Roșii Cherry Premium",
    "price": "18.00",
    "..."
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 404 | Produs nu există sau nu e al tău | `{"error": "Product not found or unauthorized"}` |
| 500 | Eroare server | `{"error": "Failed to update product"}` |

---

### 19. Delete Product (Protected)

**Endpoint:** `DELETE /api/products/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**✅ Response Success (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 404 | Produs nu există sau nu e al tău | `{"error": "Product not found or unauthorized"}` |
| 500 | Eroare server | `{"error": "Failed to delete product"}` |

---

### 20. Sync Products (Protected)

**Descriere:** Șterge toate produsele existente ale unui shop și le înlocuiește cu cele noi.

**Endpoint:** `PUT /api/products/shop/:shopId/sync`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "products": [
    {"name": "Produs 1", "price": 10.00, "description": "..."},
    {"name": "Produs 2", "price": 15.50}
  ]
}
```

**✅ Response Success (200):**
```json
{
  "message": "Products synced successfully. 2 products saved.",
  "products": [...]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 403 | Shop nu e al tău | `{"error": "You can only sync products for your own shops"}` |
| 500 | Eroare server | `{"error": "Failed to sync products"}` |

---

## 📤 Upload (Imagini)

> **Notă:** Imaginile sunt convertite în format base64 și returnate ca Data URL. Poți folosi direct URL-ul returnat în `<img src="...">`.

### 21. Upload Single Image (Protected)

**Endpoint:** `POST /api/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
image: <file>
```

**Restricții:**
- Max 5MB per imagine
- Formate acceptate: JPEG, PNG, GIF, WebP

**✅ Response Success (200):**
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "originalName": "poza.jpg",
    "mimeType": "image/jpeg",
    "size": 102400
  }
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Niciun fișier | `{"error": "No file uploaded"}` |
| 400 | Tip invalid | `{"error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."}` |
| 400 | Prea mare | `{"error": "File too large. Maximum size is 5MB."}` |
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 500 | Eroare server | `{"error": "Failed to upload image"}` |

---

### 22. Upload Multiple Images (Protected)

**Endpoint:** `POST /api/upload/multiple`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
images: <file1>
images: <file2>
images: <file3>
```

**Restricții:**
- Max 10 imagini per request
- Max 5MB per imagine
- Formate acceptate: JPEG, PNG, GIF, WebP

**✅ Response Success (200):**
```json
{
  "message": "3 images uploaded successfully",
  "images": [
    {
      "url": "data:image/jpeg;base64,/9j/4AAQ...",
      "originalName": "poza1.jpg",
      "mimeType": "image/jpeg",
      "size": 102400
    },
    {
      "url": "data:image/png;base64,iVBORw0K...",
      "originalName": "poza2.png",
      "mimeType": "image/png",
      "size": 204800
    }
  ]
}
```

**❌ Response Errors:**

| Status | Condiție | Response |
|--------|----------|----------|
| 400 | Niciun fișier | `{"error": "No files uploaded"}` |
| 400 | Tip invalid | `{"error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."}` |
| 400 | Prea mare | `{"error": "File too large. Maximum size is 5MB."}` |
| 401 | Token lipsă | `{"error": "Access token required"}` |
| 500 | Eroare server | `{"error": "Failed to upload images"}` |

---

### Flux Upload în Frontend

```javascript
// 1. Upload imagine
const uploadImage = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};

// 2. Folosește URL-ul returnat pentru shop/product
const handleImageUpload = async (file, shopId) => {
  const uploadResult = await uploadImage(file);
  
  // Update shop cu imaginea
  await api.updateShop(shopId, {
    image_url: uploadResult.image.url
  });
};
```

---

## 🌾 Producers (Legacy)

> **Notă:** Aceste endpointuri sunt pentru compatibilitate cu versiunea anterioară. Se recomandă utilizarea `/api/shops`.

### 23. Get All Producers

**Endpoint:** `GET /api/producers`

### 24. Get Producer by ID

**Endpoint:** `GET /api/producers/:id`

### 25. Update Producer (Protected)

**Endpoint:** `PUT /api/producers/:id`

---

## 🏥 Health Check

### 26. Health Check

**Endpoint:** `GET /health`

**✅ Response (200):**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## ⚠️ Coduri de Eroare

| Cod | Descriere |
|-----|-----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validare eșuată, date lipsă) |
| 401 | Unauthorized (token lipsă, invalid, expirat sau credențiale greșite) |
| 403 | Forbidden (nu ai permisiuni pentru această resursă) |
| 404 | Not Found (resursa nu există) |
| 409 | Conflict (ex: email deja există) |
| 500 | Internal Server Error |

---

## 🔑 Utilizare Token JWT

1. După login/register primești un `token`
2. Salvează token-ul în `localStorage`:
```javascript
localStorage.setItem('token', response.token);
```
3. Pentru rutele protejate, adaugă header-ul:
```
Authorization: Bearer <token>
```

**Token-ul expiră în 7 zile.**

---

## 📝 Exemple JavaScript

### Login
```javascript
const login = async (email, password) => {
  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

### Get Current User (Protected)
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Get All Shops
```javascript
const getShops = async () => {
  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/shops');
  return response.json();
};
```

### Create Shop (Protected)
```javascript
const createShop = async (shopData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('https://piata-dumbravita-api-production.up.railway.app/api/shops', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(shopData)
  });
  return response.json();
};
```

### Sync Products (Protected)
```javascript
const syncProducts = async (shopId, products) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://piata-dumbravita-api-production.up.railway.app/api/products/shop/${shopId}/sync`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ products })
  });
  return response.json();
};
```

---

## 🧪 Conturi Demo pentru Testare

| Tip | Email | Parolă |
|-----|-------|--------|
| Producer | `test.producer2@example.com` | `newpass12345` |

---

## 📊 Structura Bazei de Date

```
users (1) ──────< shops (N) ──────< products (N)
```

- Un **user** poate avea mai multe **shops** (buticuri)
- Un **shop** poate avea mai multe **products** (produse)
- Când ștergi un user, se șterg automat toate shop-urile și produsele sale

---

**Ultima actualizare:** 12 Decembrie 2025
