# Foodva

A food delivery app with React Native frontend and Express backend.

## Structure

- `mobile-app/` → Expo React Native app
- `backend/` → Express API (Dockerized), connects to Supabase

## Setup

### Frontend (Mobile App)
```bash
cd mobile-app
npm install
npx expo start
```

### Backend
```bash
cd backend
npm install
npm run dev
# or use docker-compose
```

## Development

The mobile app is built with Expo and React Native. The backend is an Express API that connects to Supabase for data storage.

## Docker

Use docker-compose to run the backend in a containerized environment:

```bash
docker-compose up
```