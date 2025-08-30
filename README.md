## Fullstack DevCase — Users Dashboard

Bu repo, başvuranların hem frontend hem de basit backend becerilerini gösterebilmesi için hazırlanmış bir Next.js projesidir. Adaylardan, hazır gelen kullanıcı listesi arayüzünü gerçek bir API ile konuşturup gerekli özellikleri tamamlamaları beklenir.

## Hızlı Başlangıç

### Gereksinimler

- Node.js >= 18.18 (önerilen: 20.x LTS)
- pnpm >= 8 (önerilen: 9)

### Kurulum ve Çalıştırma

```bash
pnpm install
pnpm dev
```

Alternatif olarak:

- npm: `npm install && npm run dev`
- yarn: `yarn && yarn dev`

### Scriptler

- `pnpm dev`: Geliştirme sunucusu (Turbopack)
- `pnpm build`: Production build
- `pnpm start`: Production sunucusu
- `pnpm lint`: ESLint kontrolü

## Teknoloji Yığını

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4
- Radix UI (Avatar, Dropdown, Switch, vb.)
- TanStack Table v8 (tablolaştırma)
- Lucide Icons

## Proje Yapısı (Özet)

```
src/
  app/
    dashboard/(index)/
      components/
        columns.tsx        # TanStack Table kolonları
        data-table.tsx     # Veri tablosu wrapper
        user-list.tsx      # Sayfa içeriği ve aksiyonlar
      page.tsx             # Dashboard sayfası
    layout.tsx             # Uygulama kök layout
  components/
    header.tsx             # Üst bar
    ui/                    # UI primitive bileşenler
  hooks/
  lib/
    types/users.d.ts       # Tip tanımları (User, UsersResponse)
    utils.ts               # Yardımcı fonksiyonlar
public/
```

## Görev Tanımı

### 1) Backend (Node.js + Express.js + ORM)

- Node.js üzerinde Express.js ile bir REST API geliştirin. ORM olarak Sequelize beklenmektedir.
- Veritabanı: PostgreSQL.
- Authentication:
  - Kayıt ve giriş uçları (email/password) ekleyin.
  - Parolaları güvenli şekilde hashleyin (örn. bcrypt).
  - JWT tabanlı kimlik doğrulama uygulayın (access token, tercihen refresh token).
- Users API (CRUD + nested):
  - `GET /users`: sayfalama, sıralama ve filtrelemeyi destekleyin.
  - `GET /users/:id`, `POST /users`, `PUT/PATCH /users/:id`, `DELETE /users/:id`.
  - Nested kullanıcılar: Bir kullanıcının alt kullanıcıları (children) olabilir. `GET /users` ve `GET /users/:id` yanıtlarında hiyerarşi dönebilirsiniz (ör. `children` alanı ile).
- Doğrulama ve tip güvenliği:
  - Request body/query doğrulaması (örn. Zod).
- Konfigürasyon:
  - `.env` ile `DATABASE_URL`, `JWT_SECRET` gibi ayarlar.
  - Bir `.env.example` dosyası sağlayın.

### 2) Frontend Entegrasyonu

- `dashboard` sayfasındaki tabloyu kendi geliştirdiğiniz backend API’si ile besleyin.
- UI şu an örnek verilerle çalışıyor; bunları API’dan gelen verilerle değiştirin.
- Mevcut tablo manuel sayfalama/sıralamayı destekler; API parametreleri ile senkron tutun.
- Nested kullanıcılar: Liste, üst kullanıcılar ve onların alt kullanıcılarını genişletilebilir satırlar (expand/collapse) ile gösterecek şekilde yapılandırılmıştır. Backend’inizden gelen hiyerarşiyi bu yapıya map’leyin.
- URL query parametrelerini güncel tutun (sayfa, sıralama, filtreler) ki yenilemede aynı görünüm korunsun.
- Loading/empty/error durumları için kullanıcı dostu geri bildirim gösterin.

### 3) Kullanıcı Ekle/Düzenle (Opsiyonel ancak artı puan)

- Modal veya ayrı sayfada bir form oluşturun.
- Tip güvenliği için şema doğrulama kullanabilirsiniz (ör. Zod).
- `POST /users` ve `PUT /users/:id` endpointleri ekleyebilirsiniz.
- Başarılı işlemlerde tabloyu güncelleyin.

## Kabul Kriterleri

- Backend tamlığı: Express.js servisinde auth ve users CRUD (ve nested listeleme) eksiksiz çalışmalı.
- Güvenlik: Parola hash, JWT imzası ve süresi, korunan rotalar, temel OWASP kontrolleri (girdi doğrulama, CORS yapılandırması) uygulanmalı.
- Tip güvenliği: Derleme ve type-check temiz olmalı. Tipler adayın şemasına göre tanımlı olmalı.
- Doğru sayfalama/sıralama/filtreleme: UI ve API tutarlı çalışmalı; nested yapı genişletme/daraltma ile doğru görünmeli.
- Hata/boş durumları: Kullanıcı dostu geri bildirim.
- Kod kalitesi: Anlaşılır mimari, okunabilir isimlendirme, küçük ve odaklı bileşenler.
- UI/UX: Mevcut tasarımla uyumlu, responsive ve erişilebilir.

## Değerlendirme Ölçütleri

- **Kod kalitesi ve mimari**: Anlaşılabilirlik, test edilebilirlik, bağımlılıkların yönetimi
- **UX ve erişilebilirlik**: Akıcı akışlar, boş/hata durumları
- **Performans ve doğruluk**: **Gereksiz render’lardan kaçınma**, doğru veri işlemleri

## Teslimat

- Önerilen süre: 48 saat. Ne kadar erken gönderirseniz sizin açınızdan o kadar iyi olacaktır.
- Teslim yöntemi:
  - Public bir GitHub repo oluşturup bize iletin.
- İsteğe bağlı olarak canlı demo (Vercel) bağlantısı paylaşabilirsiniz.
- Backend için ek olarak:
  - Kısa bir `README` (çalıştırma talimatları, migration, seed komutları).
  - `.env.example` dosyası.
  - Postman koleksiyonu veya tercihen OpenAPI/Swagger şeması.

## Notlar

- Varsayılan olarak ortam değişkeni gerekmemektedir.
- Görseller için `next.config.ts` içinde uzak görseller serbest bırakılmıştır.
- UI bileşenleri fonksiyonel React bileşenleridir ve TypeScript strict mod açıktır.
- Kullanıcı ve API tipleri sabit değildir; aday kendi veri modelini tanımlayabilir. UI tarafında gelen yanıta göre map/uyarlama yapmanız beklenir. Nested yapı için `children` gibi bir alan kullanmanız yeterlidir.
- Backend’i aynı repo altında `server/` klasöründe veya ayrı bir repoda geliştirebilirsiniz (ikisi de kabul edilir).

İyi çalışmalar! Başarılar dileriz.
