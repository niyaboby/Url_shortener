# URLSnip — Production-Grade URL Shortener
A full-stack URL shortener with analytics, QR codes, custom aliases, link expiration, and JWT authentication is basically a “mini Bitly”, but built by you end-to-end with both frontend + backend + database + security.


## 🎥 Demo Video




https://github.com/user-attachments/assets/cd741d9a-7868-427c-a70d-cae59101cb45





---

## 📁 Folder Structure

```
urlsnip/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── urlController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   ├── User.js             # Mongoose schema
│   │   │   ├── Url.js              # Mongoose schema
│   │   │   └── Click.js            # Mongoose schema + aggregations
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── url.js
│   │   │   └── analytics.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── urlService.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── Charts.js           # Line, Donut, Bar, Hourly charts
        │   ├── Navbar.js
        │   ├── QRModal.js
        │   ├── ShortenForm.js
        │   ├── StatCard.js
        │   └── UrlCard.js
        ├── context/AuthContext.js
        ├── lib/api.js
        ├── pages/
        │   ├── Dashboard.js
        │   ├── Expired.js
        │   ├── Landing.js
        │   ├── Login.js
        │   ├── NotFound.js
        │   ├── Signup.js
        │   └── UrlDetail.js
        ├── App.js
        ├── index.css
        └── index.js
```

---

## ⚙️ Prerequisites

- Node.js 18+
- MongoDB 6+ **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- npm

---

## 🚀 Setup — Local MongoDB

### 1. Install & start MongoDB

```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community

# Ubuntu
sudo apt install mongodb && sudo systemctl start mongodb

# Windows — download installer from mongodb.com
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set JWT_SECRET to a long random string
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Frontend runs on **http://localhost:3000**

> ✅ No migrations needed — Mongoose auto-creates collections on first use.

---

## ☁️ Setup — MongoDB Atlas (Cloud, Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → create free cluster
2. Create a database user (username + password)
3. Whitelist your IP (or use `0.0.0.0/0` for dev)
4. Click **Connect → Drivers** → copy the connection string
5. In `backend/.env`, set:

```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/urlsnip?retryWrites=true&w=majority
```

---

## 🔐 Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/urlsnip

JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d

BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | /api/auth/signup | `{name, email, password}` | ❌ |
| POST | /api/auth/login | `{email, password}` | ❌ |
| GET | /api/auth/me | — | ✅ |

### URLs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/url/shorten | Create short URL | ✅ |
| GET | /api/url/user/all | Get user's URLs | ✅ |
| GET | /api/url/user/analytics | Dashboard analytics | ✅ |
| GET | /api/url/:id | URL detail + analytics | ✅ |
| PUT | /api/url/:id | Update URL | ✅ |
| DELETE | /api/url/:id | Delete URL + clicks | ✅ |
| GET | /api/url/qr?url= | Generate QR code | ✅ |

### Redirect
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /:code | Redirect to original URL, records click |

### Analytics
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/analytics/:urlId | Full analytics for a URL | ✅ |

---

## 🗄️ MongoDB Collections

### `users`
```js
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password_hash: String,  // bcrypt
  createdAt: Date,
  updatedAt: Date
}
```

### `urls`
```js
{
  _id: ObjectId,
  user_id: ObjectId,      // ref: User
  original_url: String,
  short_code: String,     // unique, nanoid(7)
  custom_alias: String,   // unique, nullable
  title: String,
  is_active: Boolean,
  click_count: Number,
  unique_click_count: Number,
  expires_at: Date,       // nullable
  createdAt: Date,
  updatedAt: Date
}
```

### `clicks`
```js
{
  _id: ObjectId,
  url_id: ObjectId,       // ref: Url
  ip_address: String,
  ip_hash: String,        // SHA-256 for uniqueness tracking
  user_agent: String,
  browser: String,
  os: String,
  device_type: String,    // mobile | desktop | tablet
  referrer: String,
  clicked_at: Date
}
```

---

## 🏗️ Production Deployment

```bash
# Backend with PM2
cd backend
npm install --production
pm2 start src/server.js --name urlsnip-api

# Frontend build
cd frontend
npm run build
# Serve build/ with nginx or upload to Vercel/Netlify
```

### Nginx snippet
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api { proxy_pass http://localhost:5000; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
    location / { root /var/www/urlsnip/frontend/build; try_files $uri /index.html; }
}
```

### MongoDB Atlas indexes (auto-created by Mongoose)
- `urls.short_code` — unique
- `urls.custom_alias` — unique sparse
- `urls.user_id`
- `clicks.url_id`
- `clicks.clicked_at`
- `clicks.ip_hash`

---

## ✨ Features

- ✅ JWT authentication (signup / login / protected routes)
- ✅ URL shortening with nanoid(7) short codes
- ✅ Custom aliases (3–50 chars)
- ✅ Link expiration (1h / 24h / 7d / 30d / custom)
- ✅ Click analytics with MongoDB aggregation pipelines
- ✅ 30-day trend chart + hourly heatmap
- ✅ Device, browser, referrer breakdowns
- ✅ QR code generation + PNG download
- ✅ Link activate/deactivate toggle
- ✅ Auto-delete clicks when URL deleted
- ✅ Rate limiting, helmet, CORS
- ✅ Input validation
- ✅ Search + filter links
- ✅ Copy-to-clipboard
- ✅ Dark mode UI, fully responsive
