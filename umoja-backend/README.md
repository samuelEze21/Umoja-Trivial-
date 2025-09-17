# Umoja Trivia Backend

African culture trivia game backend built with Express.js, TypeScript, and MySQL.

## Features
- 🎮 Trivia game engine with 8 categories
- 🪙 UMOJA coin system with variable hint pricing
- 👥 Role-based access control (Player, Admin, SuperAdmin)
- 📊 Comprehensive game analytics and progress tracking
- 🌍 Focus on African culture, history, and entertainment

## Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL with Prisma ORM
- **Security**: Helmet, CORS
- **Development**: Nodemon, ts-node

## Quick Start
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev