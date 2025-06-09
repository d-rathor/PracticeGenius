# Practice Genius

Practice Genius is an educational platform designed to provide worksheets and learning materials for students. This repository contains both the frontend and backend codebases for the complete application.

## Project Structure

This project is organized as a monorepo with separate frontend and backend directories:

```
/PracticeGenius
├── frontend/           # Next.js frontend application
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── contexts/   # React context providers
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Next.js page components
│   │   ├── services/   # API service layer
│   │   ├── styles/     # Global styles and theme
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
│   ├── public/         # Static assets
│   └── ...             # Configuration files
│
└── backend/            # Express.js backend application
    ├── src/            # Source code
    │   ├── config/     # Configuration files
    │   ├── controllers/# Route controllers
    │   ├── middleware/ # Express middleware
    │   ├── models/     # MongoDB models
    │   ├── routes/     # API route definitions
    │   ├── services/   # Business logic services
    │   └── utils/      # Utility functions
    ├── uploads/        # File upload directory
    └── ...             # Configuration files
```

## Tech Stack

### Frontend
- Next.js 15+
- TypeScript
- React
- NextAuth.js (JWT authentication)
- CSS Modules / Tailwind CSS
- Axios for API communication

### Backend
- Express.js
- Node.js
- MongoDB with Mongoose
- JWT authentication
- RESTful API

### Deployment
- Frontend: Netlify
- Backend: Render/Heroku
- Database: MongoDB Atlas

## Getting Started

### Prerequisites
- Node.js 20.11.1 or higher
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/practice-genius.git
cd practice-genius
```

2. Set up the frontend:
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Update the environment variables in .env.local
```

3. Set up the backend:
```bash
cd ../backend
npm install
cp .env.example .env
# Update the environment variables in .env
```

4. Start the development servers:

For the frontend:
```bash
cd frontend
npm run dev
```

For the backend:
```bash
cd backend
npm run dev
```

5. Seed the database (optional):
```bash
cd backend
npm run seed
```

## Development Workflow

1. The frontend runs on http://localhost:3000
2. The backend API runs on http://localhost:8080
3. API endpoints are documented in the backend README.md

## Deployment

### Frontend Deployment (Netlify)
- Connected to GitHub repository
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables set in Netlify dashboard

### Backend Deployment (Render/Heroku)
- Connected to GitHub repository
- Build command: `npm install`
- Start command: `npm start`
- Environment variables set in deployment platform dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details.
