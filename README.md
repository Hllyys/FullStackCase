# Fullstack DevCase

React (TS) + Node.js/Express + PostgreSQL + Sequelize tabanlı örnek kullanıcı yönetimi uygulaması.  
JWT (Bearer) kimlik doğrulama, role/manager ilişkileri, sayfalı & sıralı kullanıcı listesi içerir.

---

## 🖥️ Frontend — Özellikler ve Ekranlar

### 🔐 Giriş (Auth)
- `/login`: E-posta & şifre ile giriş.  
- Başarılı girişte JWT local state’e alınır ve tüm isteklerde **Bearer** header ile gönderilir.  
- Auth guard: Giriş yapılmamışsa `/users` sayfasına erişilemez.  

### 👥 Kullanıcı Listesi
- `/users`: Sayfalama, arama, sıralama (ad, rol, durum).  
- Satırda **sil** ve **düzenle** kısayolları.  
- Boş sonuçta açıklayıcı “Kayıt bulunamadı” mesajı.  

### ➕ Ekle (Create)
- `/users/new`: Form (react-hook-form + Zod).  
- Zorunlu alan uyarıları, inline hata mesajları.  
- Kaydet sonrası listeye dönüş ve toast bildirimi: *“Kullanıcı oluşturuldu”*.  

### ✏️ Güncelle (Edit)
- `/users/:id/edit`: Sunucudan gelen mevcut değerler doldurulur.  
- Sadece değişen alanlar gönderilir.  
- Kaydet sonrası detay/listeye dönüş + başarı toast.  

### 🗑️ Silme (Delete)
- `/users`: Listede “Sil” butonu → **onay modalı** (kullanıcı adı ile birlikte).  
- Başarılı silme sonrası liste durumu korunur, sayfa sayısı değişirse son sayfaya yönlendirilir.  
- Başarı/hata durumlarında toast bildirimleri.  

### 🧭 Kullanılabilirlik & Tasarım
- **Arama kutusu**: debounce (300–500ms).  
- **Sıralama ikonları**: artan/azalan açıkça görünür.  
- **Hata durumları**: kullanıcıya özet mesaj + “tekrar dene” butonu.  
- **Klavye erişilebilirliği** ve form odak yönetimi.  
- **Renk/tema**: açık tema, Tailwind tabanlı modern kart tasarımı.  

⚠️ **Not:**  
Kayıt sırasında **sadece `roleId` alanı zorunlu olarak alınır**, **`managerId` ve `status` alanları ise sonradan güncelleme (update) işleminde atanır.**

---

## 🧰 Backend (Node.js + Express + Sequelize + PostgreSQL)

### Mimari & Yığın
- **Express**: REST API katmanı  
- **Sequelize (PostgreSQL)**: ORM + migrasyon/seed  
- **Zod**: request validasyonu  
- **JWT (access + refresh)**: kimlik doğrulama  
- **dotenv + zod env**: ortam değişkenleri  
- **CORS**: güvenlik  

### Ortam Değişkenleri (`.env.example`)
env
DATABASE_URL=postgresql://postgres:1234@localhost:5433/DevCase
DB_SYNC=false

JWT_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

PORT=4000
CORS_ORIGIN=http://localhost:3000

Veri Modeli

Role: id, name
User: id, fullName, email, passwordHash, roleId, managerId, status (active/passive), timestamps

Kimlik Doğrulama Akışı

POST /auth/register → Public, yeni kullanıcı oluşturur.
POST /auth/login → Public, access + refresh token üretir.
POST /auth/refresh → Refresh token ile yeni access token alır.
POST /auth/logout → Refresh token geçersiz hale gelir.


Kullanıcı İşlemleri

GET /users → Listeleme (sayfa, arama, sıralama, filtre).
POST /users → Admin, yeni kullanıcı ekler.
GET /users/:id → ID’ye göre kullanıcı gösterme.
PUT /users/:id → Güncelleme.
DELETE /users/:id → Silme.
GET /roles → Roller.

Validasyon

Login: { email, password }
Register/Create: { fullName, email, password, roleId }
ListUsers: query param validasyonu (sayfalama/sıralama/filtre).

DATABASE_URL: tek bağlantı stringi (sequelize ve runtime ortak).
DB_SYNC: dev’de true yaparsan sequelize.sync({ alter:true }). Prod’da kesin false.


---

## ⚡ Kurulum ve Çalıştırma

### 0) Gereksinimler
- Node.js 18+  
- PostgreSQL 13+  


2) Bağımlılıklar
# kök klasör
npm run i:all
# veya ayrı ayrı
cd server && npm i
cd ../client && npm i

3) Veritabanı Migrasyon & Seed
cd server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

4) Çalıştırma
# sadece backend
cd server && npm run dev
# sadece frontend
npm run dev


#Postman

*Kayıt olma
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "fullName": "admin",
  "email": "admin@case.com",
  "password": "nnnnnnn",
  "roleId": 1
}


*Giriş yapma
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@case.com",
  "password": "nnnnnnn"
}


*Refresh token
POST http://localhost:4000/api/auth/refresh
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "<accsessToken>"
}


*Cikis yapma
POST http://localhost:4000/api/auth/logout
Authorization: Bearer <accessToken>

*Kullanıcı Ekleme
POST http://localhost:4000/api/users
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fullName": "staff",
  "email": "staff@case.com",
  "password": "123456",
  "roleId": 2
}


*Tum kullanıcıları doner
GET http://localhost:4000/api/users
Authorization: Bearer <accessToken>


*Aranılan kullanıcıyı doner
GET http://localhost:4000/api/users/id
Authorization: Bearer <accessToken>


*Kullanıcı Silme
DELETE http://localhost:4000/api/users/35
Authorization: Bearer <accessToken>


*Kullanıcı guncelleme
PUT http://localhost:4000/api/users/id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fullName": "deneme",
  "isActive": false,
  "managerId": 1
}
