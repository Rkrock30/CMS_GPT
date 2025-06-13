# CMS GPT Backend (Next.js API)

This is a backend-only CMS enhancement using Next.js API routes, MongoDB, JWT auth, and OpenAI GPT for SEO metadata generation and bulk updates.

## 📦 Tech Stack
- Next.js API Routes (Backend only)
- MongoDB Atlas
- JWT Authentication (Access + Refresh Tokens)
- OpenAI GPT-3.5 Turbo
- TypeScript
- Postman for API testing

## 🛠 Setup Instructions

1. **Clone the repo**
```bash
git clone https://github.com/your-username/cms-gpt-backend.git
cd cms-gpt-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**
```env
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```

4. **Run the dev server**
```bash
npm run dev
```

## 🧪 Postman Collection

Import `CMS-GPT2.postman_collection.json` in Postman.

## 📂 Key API Routes

### `POST /api/auth/signup`
Registers a user.

### `POST /api/auth/login`
Logs in a user and returns access + refresh tokens.

### `POST /api/pages/:id/seo/generate`
Generates SEO metadata using OpenAI.

### `POST /api/pages/bulk-update`
Bulk updates page content and SEO based on shared prompt.

---

## 🤖 OpenAI Integration
- Uses `gpt-3.5-turbo`
- Returns `meta_title`, `meta_description`, and `keywords[]`

---

## 📁 Project Structure (Windsurf Style)
```
├── lib/
│   └── db.ts              # MongoDB connection
├── pages/
│   └── api/
│       └── auth/
│           ├── signup.ts
│           └── login.ts
│       └── pages/
│           ├── [id]/seo/generate.ts
│           └── bulk-update.ts
├── types/
│   └── page.ts
├── utils/
│   └── jwt.ts
└── .env.local
```

---

## 👤 Author
Ranjeet Gupta
