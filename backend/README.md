# Practice Genius Backend API

This is the backend API for Practice Genius, an educational platform designed to provide worksheets and learning materials for students.

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/practice-genius-backend.git
cd practice-genius-backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and update the values
   - Make sure to set the MongoDB connection string

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. The server will start on port 8080 by default. You can access the API at [http://localhost:8080](http://localhost:8080).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Worksheets
- `GET /api/worksheets` - Get all worksheets with filtering and pagination
- `GET /api/worksheets/:id` - Get worksheet by ID
- `POST /api/worksheets` - Create new worksheet
- `PUT /api/worksheets/:id` - Update worksheet
- `DELETE /api/worksheets/:id` - Delete worksheet
- `POST /api/worksheets/:id/download` - Download worksheet and track download

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions (admin only)
- `GET /api/subscriptions/:id` - Get subscription by ID
- `GET /api/subscriptions/user/:userId` - Get subscriptions by user ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Subscription Plans
- `GET /api/subscription-plans` - Get all subscription plans
- `GET /api/subscription-plans/:id` - Get subscription plan by ID
- `POST /api/subscription-plans` - Create new subscription plan (admin only)
- `PUT /api/subscription-plans/:id` - Update subscription plan (admin only)
- `DELETE /api/subscription-plans/:id` - Delete subscription plan (admin only)

### Settings
- `GET /api/settings/:type` - Get settings by type
- `PUT /api/settings/:type` - Update settings by type (admin only)

## Project Structure

- `src/config/` - Configuration files
- `src/controllers/` - Route controllers
- `src/middleware/` - Express middleware
- `src/models/` - MongoDB models
- `src/routes/` - API route definitions
- `src/services/` - Business logic services
- `src/utils/` - Utility functions
- `uploads/` - File upload directory

## Database Models

### User Model
```javascript
{
  email: String,
  password: String, // Hashed
  name: String,
  role: String, // 'admin' or 'user'
  activeSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  downloadHistory: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Worksheet Model
```javascript
{
  title: String,
  description: String,
  subject: String,
  grade: String,
  subscriptionLevel: String, // 'Free', 'Essential', 'Premium'
  keywords: [String],
  fileUrl: String,
  thumbnailUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  downloads: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

This project is configured for deployment on Render/Heroku:

- Set the appropriate environment variables in the deployment platform
- Ensure MongoDB connection string is properly configured
- Set NODE_ENV to 'production' for production deployments
