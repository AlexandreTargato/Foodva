# Foodva Backend

Express.js TypeScript backend for the Foodva food delivery app, built with Supabase integration.

## Features

- 🚀 **Express.js** with TypeScript
- 🔐 **Supabase Auth** integration
- 📂 **Supabase Storage** for image uploads
- 🗄️ **PostgreSQL** via Supabase
- 🐳 **Docker** containerized
- 📝 **Type-safe** development
- 🛡️ **Security** middleware (Helmet, CORS)
- 📊 **Request logging** with Morgan

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/profile` - Create user profile

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts/feed` - Get posts feed
- `GET /api/posts/:postId` - Get specific post
- `DELETE /api/posts/:postId` - Delete post

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `GET /api/users/:userId/posts` - Get user's posts
- `GET /api/users/search?q=query` - Search users
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user
- `GET /api/users/:userId/follow-status` - Check follow status

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/:postId` - Get post comments
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

### Likes
- `POST /api/likes` - Like post
- `DELETE /api/likes` - Unlike post
- `GET /api/likes/status/:postId` - Get like status
- `GET /api/likes/:postId` - Get post likes
- `GET /api/likes/user/:userId` - Get user likes

## Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Docker (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   NODE_ENV=development
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_STORAGE_BUCKET=foodva-images
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production build**
   ```bash
   npm run build
   npm start
   ```

### Docker

1. **Build image**
   ```bash
   docker build -t foodva-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env foodva-backend
   ```

3. **Using docker-compose** (from project root)
   ```bash
   docker-compose up backend
   ```

## Database Schema

Required Supabase tables:

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(2000),
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### likes
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### follows
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration
│   ├── db/              # Database clients
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── index.ts         # App entry point
├── dist/               # Compiled JavaScript
├── Dockerfile          # Docker configuration
└── package.json        # Dependencies
```

## Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run typecheck` - Type checking without building
- `npm test` - Run tests

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No (default: 3000) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name | No (default: foodva-images) |

## Authentication

The API uses Supabase Auth with Bearer tokens. Include the token in requests:

```
Authorization: Bearer your_supabase_token
```

## Development

1. **Type Safety**: All code is written in TypeScript with strict type checking
2. **Service Layer**: Business logic is separated in service classes
3. **Error Handling**: Centralized error handling middleware
4. **Validation**: Request validation using Joi
5. **Security**: Helmet for security headers, CORS enabled

## Deployment

Ready for deployment on:
- **AWS ECS** (Elastic Container Service)
- **Railway**
- **Render**
- **Heroku**
- Any Docker-compatible platform

## License

ISC