# Practice Genius - Project Specification

## Project Overview

Practice Genius is an educational platform that provides worksheets and educational resources to teachers and students. The application follows an API-first architecture with a React/Next.js frontend and Express/MongoDB backend. The backend uses MongoDB Atlas for cloud database storage, ensuring data persistence across browsers and devices.

## Project Structure
Our project directories are C:\Devendra\Projects\PracticeGenius\frontend\ and C:\Devendra\Projects\PracticeGenius\backend 
### Root Directory Structure

```
PracticeGenius/
├── backend/                  # Backend Express.js API
├── frontend/                 # Next.js frontend application
├── netlify.toml              # Netlify configuration (in repository root)
└── PracticeGenius-Specification.md  # This specification file
```

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.js            # Environment configuration and validation
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication controller
│   │   ├── settings.controller.js    # Settings controller
│   │   ├── subscription-plan.controller.js  # Subscription plan controller
│   │   ├── subscription.controller.js      # Subscription controller
│   │   ├── user.controller.js        # User controller
│   │   └── worksheet.controller.js   # Worksheet controller
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   ├── error.js          # Error handling middleware
│   │   └── upload.js         # File upload middleware using multer
│   ├── models/
│   │   ├── settings.model.js        # Settings model
│   │   ├── subscription-plan.model.js  # Subscription plan model
│   │   ├── subscription.model.js    # Subscription model
│   │   ├── user.model.js            # User model
│   │   └── worksheet.model.js       # Worksheet model
│   ├── routes/
│   │   ├── auth.routes.js           # Authentication routes
│   │   ├── index.js                 # Main routes index
│   │   ├── settings.routes.js       # Settings routes
│   │   ├── subscription-plan.routes.js  # Subscription plan routes
│   │   ├── subscription.routes.js   # Subscription routes
│   │   ├── user.routes.js           # User routes
│   │   └── worksheet.routes.js      # Worksheet routes
│   ├── utils/
│   │   ├── async-handler.js         # Async error handler utility
│   │   ├── seed.js                  # Database seeding utility
│   │   └── subscription-checker.js  # Subscription expiration checker
│   └── server.js                    # Main server entry point
├── start-server.js                  # Server startup script with environment setup
├── package.json                     # Backend dependencies and scripts
└── .env                             # Environment variables (not in repo)
```

### Frontend Structure

```
frontend/
├── public/
│   └── ...                   # Static assets
├── src/
│   ├── components/
│   │   ├── auth/             # Authentication-related components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── hoc/
│   │   │   └── withAuth.tsx  # Authentication HOC for route protection
│   │   ├── layout/           # Layout components
│   │   ├── ui/
│   │   │   └── LoadingSpinner.tsx  # Loading spinner component
│   │   └── worksheets/       # Worksheet-related components
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Authentication context
│   │   ├── SettingsContext.tsx  # Settings context
│   │   ├── SubscriptionContext.tsx  # Subscription context
│   │   └── index.tsx         # Combined context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/
│   │   ├── _app.tsx          # Next.js app component with AuthProvider
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── admin/            # Admin pages
│   │   └── ...               # Other pages
│   ├── services/
│   │   ├── api.ts            # Base API configuration
│   │   ├── auth.service.ts   # Authentication service
│   │   ├── settings.service.ts  # Settings service
│   │   ├── subscription.service.ts  # Subscription service
│   │   ├── user.service.ts   # User service
│   │   └── worksheet.service.ts  # Worksheet service
│   ├── styles/               # Global styles
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Next.js middleware for route protection
├── .env                      # Environment variables (not in repo)
├── next.config.js            # Next.js configuration with API proxy
├── package.json              # Frontend dependencies and scripts
├── netlify.toml              # Netlify configuration
├── start-dev.js              # Development startup script
└── tsconfig.json             # TypeScript configuration
```

## Key Components and Features

### Authentication System

- JWT-based authentication with direct API calls to backend
- Role-based access control (admin, user)
- Protected routes using React HOC and localStorage token verification
- Persistent sessions using localStorage for token storage
- Admin and regular user role separation with different dashboards

### Subscription Management

- Subscription plans (Free, Essential, Premium)
- Subscription creation, renewal, and cancellation
- Automatic subscription expiration checking
- Download limits based on subscription level

### Worksheet Management

- CRUD operations for worksheets
- File uploads with validation
- Download tracking
- Search and filtering

### Worksheet File Storage and Delivery (Backblaze B2)

Worksheet files (e.g., PDF, DOCX) are not stored on the application server. Instead, they are securely stored and delivered using Backblaze B2, an S3-compatible cloud object storage service.

-   **Storage Provider**: Backblaze B2 was chosen for its cost-effectiveness and S3-compatible API.
-   **Backend Integration**: The backend uses the official AWS SDK v3 for JavaScript (`@aws-sdk/client-s3`) to interact with the B2 service. The S3 client is configured with the B2 endpoint URL and application key credentials.
-   **File Uploads**:
    -   Uploads are handled by `multer` and `multer-s3`, which stream files directly from the client's POST request to the B2 bucket. This avoids saving files temporarily on the server.
    -   **Compatibility Fix**: A critical fix was implemented to ensure compatibility with B2's API. The `flexibleChecksumsMiddleware`, which adds unsupported `x-amz-checksum-*` headers, is programmatically removed from the S3 client's middleware stack. This prevents upload failures and 500 errors.
-   **File Downloads**:
    -   All worksheet files in the B2 bucket are private and cannot be accessed directly via public URLs.
    -   To enable secure downloads, the backend provides the `/api/worksheets/:id/download` endpoint. When a user requests a download, this endpoint verifies their permissions (e.g., subscription level, admin status) and then generates a short-lived, secure **pre-signed URL** for the requested file.
    -   The frontend receives this pre-signed URL and initiates the download, providing the user with temporary, secure access to the private file.

### Settings Management

- Subscription settings (pricing, features)
- Site settings
- User preferences

### Admin Dashboard

- User management
- Subscription management
- Worksheet management
- Analytics and statistics

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change user password

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/recent` - Get recent users (admin only)
- `GET /api/users/:id` - Get user by ID (admin or own user)
- `PUT /api/users/:id` - Update user (admin or own user)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/:id/downloads` - Get user download history

### Worksheets

- `GET /api/worksheets` - Get all worksheets
- `GET /api/worksheets/recent` - Get recent worksheets
- `GET /api/worksheets/:id` - Get worksheet by ID
- `POST /api/worksheets` - Create worksheet (admin only)
- `PUT /api/worksheets/:id` - Update worksheet (admin only)
- `DELETE /api/worksheets/:id` - Delete worksheet (admin only)
- `GET /api/worksheets/:id/download` - Download worksheet and track download

### Subscriptions

- `GET /api/subscriptions` - Get all subscriptions (admin only)
- `GET /api/subscriptions/current` - Get current user's subscription
- `GET /api/subscriptions/recent` - Get recent subscriptions (admin only)
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription (admin only)
- `DELETE /api/subscriptions/:id` - Delete subscription (admin only)
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- `PUT /api/subscriptions/:id/renew` - Renew subscription

### Subscription Plans

- `GET /api/subscription-plans` - Get all subscription plans
- `GET /api/subscription-plans/:id` - Get subscription plan by ID
- `POST /api/subscription-plans` - Create subscription plan (admin only)
- `PUT /api/subscription-plans/:id` - Update subscription plan (admin only)
- `DELETE /api/subscription-plans/:id` - Delete subscription plan (admin only)

### Settings

- `GET /api/settings/subscription_settings` - Get subscription settings
- `PUT /api/settings/subscription_settings` - Update subscription settings (admin only)
- `GET /api/settings/site_settings` - Get site settings
- `PUT /api/settings/site_settings` - Update site settings (admin only)

## Frontend API Routes

The frontend uses Next.js API routes to proxy requests to the backend API, handling authentication, file uploads, and data formatting:

### Worksheet API Routes

- `GET /api/admin/worksheets` - Proxy to fetch worksheets from backend `/api/worksheets` endpoint
- `POST /api/admin/worksheets` - Handle multipart form data for worksheet creation with file uploads
  - Uses `formidable` to parse incoming form data
  - Uses `form-data` package to forward file streams to backend
  - Handles file field naming to match backend expectations (`file`)
  - Maps subscription plan IDs to subscription level strings
  - Forwards JWT token in Authorization header

### Authentication API Routes

- `POST /api/auth/login` - Proxy login requests to backend with credentials
- `POST /api/auth/register` - Handle user registration with validation
- `GET /api/auth/me` - Fetch current user profile with token

### Admin API Routes

- `GET /api/admin/users` - Proxy to fetch users from backend with admin authorization
- `GET /api/admin/subscriptions` - Proxy to fetch subscriptions with admin authorization
- `GET /api/admin/subscription-plans` - Proxy to fetch subscription plans

## Frontend Implementation Status

### UI Components

#### Component Fixes (Updated June 8, 2025)
- **Card Component Usage**: Fixed Card component imports and usage across multiple pages
  - Changed from property access pattern (`Card.Header`) to named imports (`CardHeader`, `CardContent`, `CardFooter`)
  - Updated imports in dashboard/worksheets, admin dashboard, and subscription pages
- **Error Handling**: Added null/undefined checks in utility functions to prevent runtime errors
  - Updated `getDifficultyColor` and `getSubjectColor` functions to safely handle undefined values
- **API Integration**: Improved API endpoint handling in public worksheets page
  - Added proper environment variable usage for API URLs
  - Implemented fallback to mock data when in development mode
- **TypeScript Improvements**: Fixed Set iteration errors by using `Array.from()` instead of spread syntax
- **JSX Structure**: Fixed broken JSX hierarchy and component nesting issues

### Authentication

#### Authentication Integration (Updated June 8, 2025)
- **Direct API Authentication**: Completely removed NextAuth.js and implemented direct API calls to backend for authentication
- **JWT Token Handling**: Implemented JWT token storage in localStorage under 'practicegenius_token' key and proper transmission in Authorization headers
- **User Data Storage**: Storing user information in localStorage under 'user' key as JSON string
- **Session Management**: Created custom AuthContext to manage authentication state using localStorage instead of server-side sessions
- **Login Flow**: Updated login page to use direct API calls to '/api/auth/login' with proper error handling and role-based redirects
- **Registration Flow**: Fixed signup page to call backend API endpoint '/api/auth/register' with correct field names (name instead of username)
- **Admin Dashboard**: Created separate admin dashboard with role-based access control using localStorage user role
- **Authentication HOC**: Updated withAuth HOC to protect routes based on localStorage token presence and user role
- **Protected Routes**: Ensured dashboard and admin routes are properly protected based on user role with client-side checks
- **Middleware Simplification**: Simplified Next.js middleware to focus on client-side auth checks instead of server-side token verification
- **Full Page Reloads**: Using window.location for redirects after login/logout to ensure token is properly used in subsequent requests
- **Logout Functionality**: Implemented logout by clearing localStorage and redirecting to home page
- **CORS Configuration**: Updated backend CORS settings to allow credentials and proper headers for authentication
- **API Proxy**: Configured Next.js API proxy to forward requests to backend server

## Backend Implementation Status

### Express Server Implementation ✅

- **Server Configuration**: Implemented robust Express server with proper error handling
- **MongoDB Integration**: Connected to MongoDB Atlas cloud database
- **API Routes**: Implemented all core API routes for authentication, users, worksheets, subscriptions, and settings
- **Middleware**: Added authentication, error handling, and file upload middleware
- **Controllers**: Implemented controllers for all main resources
- **Error Handling**: Added comprehensive error handling to prevent server crashes

### MongoDB Atlas Integration ✅

- **Cloud Database**: Set up MongoDB Atlas cluster for data persistence
- **Connection String**: Configured secure connection with proper authentication
- **Error Handling**: Implemented robust error handling for database connection issues
- **Graceful Degradation**: Server continues to run with limited functionality if database connection fails

### Authentication System ✅

- **JWT Authentication**: Implemented JWT-based authentication
- **User Registration**: Added secure user registration with password hashing
- **Login System**: Implemented secure login with JWT token generation
- **Profile Management**: Added profile retrieval and update functionality
- **Password Management**: Implemented secure password change functionality
- **Authorization Middleware**: Added role-based access control middleware

### Data Models ✅

- **User Model**: Implemented with authentication and profile fields
- **Worksheet Model**: Created with metadata and file storage capabilities
- **Subscription Model**: Implemented with relationship to users and plans
- **Subscription Plan Model**: Created with pricing tiers and feature lists
- **Settings Model**: Implemented for application configuration

## Environment Variables

### Backend (.env)

```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb+srv://devendrarathor:AUhkNDOr3164jhct@practicegenius.leeblag.mongodb.net/?retryWrites=true&w=majority&appName=PracticeGenius
JWT_SECRET=practicegenius-dev-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
B2_BUCKET_NAME=your-b2-bucket-name
B2_ENDPOINT=s3.us-west-000.backblazeb2.com
B2_REGION=us-west-000
B2_ACCESS_KEY_ID=your-b2-key-id
B2_SECRET_ACCESS_KEY=your-b2-secret-application-key
```

> Note: The MongoDB URI uses MongoDB Atlas for cloud database storage. This ensures data persistence across browsers and devices.

### Frontend (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Deployment Configuration

### Netlify Configuration

The `netlify.toml` file must be placed in the repository root directory, not in subdirectories like `/frontend`. Key settings:

```toml
[build]
  command = "npm run build"
  publish = ".next"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20.11.1"
  NPM_FLAGS = "--legacy-peer-deps"

# Redirects for critical paths
[[redirects]]
  from = "/profile"
  to = "/dashboard/profile"
  status = 301
  force = true
```

### Node.js Version Requirements

- Next.js 15 requires Node.js ^18.18.0 || ^19.8.0 || >= 20.0.0
- Some npm packages like minimatch@10.0.1 and path-scurry@2.0.0 require Node.js 20 or higher
- Set NODE_VERSION to "20.11.1" in netlify.toml for compatibility

## Deployment Learnings & Key Fixes

During the course of development and deployment, particularly when integrating the frontend with the backend API hosted on Render, several critical issues were identified and resolved:

### 1. CORS (Cross-Origin Resource Sharing) Resolution

- **Problem**: The frontend (e.g., `https://practicegeniusv2.netlify.app`) was blocked by CORS policy when attempting to fetch data from the backend API (e.g., `https://practicegenius-api.onrender.com`). The browser error "No 'Access-Control-Allow-Origin' header is present" was common.
- **Solution Steps**:
    - **Standard `cors` Package**: Replaced custom CORS middleware in `backend/src/server.js` with the standard `cors` npm package. This provided more robust and predictable behavior.
    - **Whitelist Configuration**: The `cors` middleware was configured with a specific whitelist of allowed origins (e.g., `['https://practicegeniusv2.netlify.app', 'http://localhost:3000']`) and options for `credentials: true`, and appropriate `methods`, `allowedHeaders`, and `exposedHeaders`.
    - **Logging**: Added detailed logging within the `cors` configuration's `origin` function to verify the `Origin` header received from requests and confirm whether it was allowed.
    - **Render Environment Variables**: Commented out platform-level `CORS_*` environment variables in `render.yaml` to prevent them from conflicting with or overriding the application-level CORS configuration in `server.js`.

### 2. Dockerfile and Backend Build Process

- **Problem**: The backend deployment on Render initially failed with "Error: Cannot find module 'express'" (and subsequently other modules). This was because the `Dockerfile` was not correctly structured to build the backend application and install its specific dependencies.
- **Initial Incorrect Setup**: The `Dockerfile` was using the `package.json` from the project root, which did not contain the backend's dependencies. It then tried to run `backend/src/server.js` without these modules.
- **Solution - Dockerfile Rewrite**:
    - The `Dockerfile` was significantly rewritten to focus specifically on the backend application.
    - **Targeted Dependency Installation**:
        - Copied `backend/package.json` and `backend/package-lock.json` into a `/usr/src/app/backend/` directory within the Docker image.
        - Changed `WORKDIR` to `/usr/src/app/backend`.
        - Ran `npm install --production --no-optional` within this `backend` directory to install dependencies listed in `backend/package.json` into `/usr/src/app/backend/node_modules`.
    - **Code Copy**: Copied the `backend/src` directory into `/usr/src/app/backend/src` in the image.
    - **Correct Startup Command**: The `CMD` was updated to `["node", "src/server.js"]`, executed from the `/usr/src/app/backend` working directory.
- **Outcome**: This ensured that the backend application was built with its own set of dependencies, resolving the module loading errors and allowing the server to start correctly.

These fixes were crucial for establishing stable communication between the deployed frontend and backend services.


## UI Strategy

### 9.1 Hybrid Approach
- **Home Page**: Recreate the exact home page from practicegenius.online for brand consistency
- **Other Pages**: Develop from scratch using a clean, consistent design approach
- **Design System**: Create a unified design system that maintains brand identity while improving UX
- **Asset Reuse**: Selectively reuse brand assets (logos, key images) from the existing site

## 10. Subscription Plan Integration

### 10.1 Subscription Plan Model
- **Plan Types**: Implemented three subscription tiers: Free, Essential, and Premium
- **Plan Features**:
  - Free: Basic access with limited worksheets and downloads (3 per month)
  - Essential: Access to 100+ worksheets, 10 downloads per month, email support ($12.99/month or $9.99/year)
  - Premium: Access to 500+ premium worksheets, unlimited downloads, advanced features ($24.99/month or $19.99/year)
- **Database Schema**: MongoDB schema with name (enum: ['Free', 'Essential', 'Premium']), price (monthly/yearly), features, and download limits

### 10.2 Backend Implementation
- **API Endpoints**: Created RESTful endpoints for subscription plan management
  - GET /api/subscription-plans: Public endpoint to retrieve all subscription plans
  - POST/PUT/DELETE endpoints with admin-only access
- **Seeding Script**: Created script to populate the database with the three subscription plans
- **Access Control**: Worksheets are associated with subscription plans to control user access

### 10.3 Frontend Integration
- **Pricing Page**: Displays subscription options with features and pricing
- **Admin Interface**: Added subscription plan selection to worksheet creation form
- **API Integration**: Created frontend API endpoints to communicate with backend subscription services
- **Response Format Handling**: Properly handling the backend response format {success: true, data: [...plans]}

### 10.4 Worksheet Access Control
- **Plan-Based Access**: Worksheets are assigned to specific subscription plans
- **User Experience**: Users can only access worksheets included in their subscription plan
- **Admin Control**: Admins can assign worksheets to subscription plans during creation

### 9.2 Implementation Process
1. **Home Page Recreation**: 
   - Extract HTML structure and CSS from the existing home page
   - Recreate with identical layout and styling
   - Ensure responsive behavior matches the original

2. **Design System Development**:
   - Define color palette, typography, and spacing based on existing brand
   - Create reusable component library with consistent styling
   - Document component usage and variations

3. **New Page Development**:
   - Design pages from scratch using the established design system
   - Implement improved UX patterns while maintaining brand consistency
   - Ensure responsive design across all devices

### 9.3 Tools and Techniques
- **Browser DevTools**: Extract home page structure and styling
- **Component Library**: Build reusable React components with consistent styling
- **Design Documentation**: Maintain design system documentation
- **Responsive Testing**: Test across multiple device sizes

### 9.4 Implementation Status

#### Completed Components

1. **Home Page Components**
   - `Hero.tsx` - Main banner with call-to-action buttons and statistics section with orange accents
   - `Features.tsx` - "Why Choose PracticeGenius" section with three key benefits
   - `HowItWorks.tsx` - Step-by-step process explanation with numbered steps
   - `Pricing.tsx` - Three-tier pricing plans (Free, Essential, Premium) with feature lists and CTAs
   - `Testimonials.tsx` - Parent testimonials with orange accent borders and simplified design
   - `CallToAction.tsx` - Final signup prompt section with orange background and prominent CTA button

2. **Layout Component**
   - `MainLayout.tsx` - Consistent layout with header and footer, featuring orange square logo with book icon

3. **Home Page Implementation**
   - `index.tsx` - Main page that assembles all components in the correct order

#### Design Elements Implemented
- **Color Scheme**: Orange and black primary colors (#f97316 for orange accents, black for hero section)
- **Typography**: Bold headings with clean sans-serif text, orange highlights for important text
- **UI Elements**: Cards with white backgrounds and orange accents, rounded buttons with hover effects
- **Iconography**: SVG icons for features, checkmarks in pricing tables, and book icon in logo
- **Pricing Cards**: Three-tier system with "Popular" tag on Essential plan, Indian Rupee (₹) pricing
- **Testimonials**: Clean design with left orange border, italicized quotes, and attribution

#### Responsive Behavior
All components are built with responsive design in mind:
- Mobile-first approach with Tailwind CSS
- Flexible layouts that adapt to different screen sizes
- Stacked layouts on mobile, grid layouts on desktop

#### Next Steps
1. **Asset Management**
   - Optimize images for better performance
   - Ensure all images are properly displayed across browsers
   - Add alt text for accessibility

2. **Interactive Elements**
   - Implement mobile menu functionality
   - Enhance hover effects and transitions
   - Add animations for scrolling elements

3. **Design System Components** ✅
   - Created comprehensive UI component library with the following components:
     - `Button.tsx` - Multiple variants (default, secondary, outline, ghost, link, destructive) with loading states
     - `Card.tsx` - Flexible container with header, content, and footer sections
     - `Input.tsx` - Form input with label, error, and helper text support
     - `Badge.tsx` - Status indicators with multiple color variants
     - `Alert.tsx` - Notification components with various severity levels
     - `Modal.tsx` - Dialog component with backdrop, animations, and multiple sizes
   - Created comprehensive documentation in `README.md` with usage examples and props tables
   - Implemented accessibility features including ARIA attributes
   - Added utility functions in `utils.ts` for consistent class name handling
   - Implement dark mode toggle (pending)

4. **Integration with Backend** ✅
   - Connected authentication system to backend API using NextAuth.js
   - Implemented secure JWT token handling between frontend and backend
   - Replaced localStorage mock authentication with proper API-based authentication
   - Configured proper session management with user roles and permissions
   - Fixed component rendering issues in protected routes

5. **Testing and Optimization**
   - Perform cross-browser testing
   - Optimize for performance (lazy loading, code splitting)
   - Implement accessibility improvements (ARIA attributes, keyboard navigation)

## Implementation Plan Status

### 1. Home Page Recreation ✅
- Extracted and analyzed design elements from the original site
- Created component structure for the homepage
- Implemented responsive design with Tailwind CSS
- Fixed image loading issues in middleware

### 2. Design System Development

#### Step 1: Extract Brand Elements ✅
- Created color palette based on orange and black brand colors
- Documented typography and spacing guidelines

#### Step 2: Build Component Library ✅
```
frontend/src/components/ui/
├── Button.tsx              # Primary, secondary, outline variants with loading states
├── Card.tsx                # Content containers with header, content, and footer
├── Input.tsx               # Form inputs with labels, validation, and error states
├── Badge.tsx               # Status indicators and tags with multiple variants
├── Alert.tsx               # Notifications and messages with severity levels
├── Modal.tsx               # Dialog windows with animations and multiple sizes
├── LoadingSpinner.tsx      # Loading indicator component
└── README.md               # Component documentation
```

#### Step 3: Document Design System ✅
- Created comprehensive documentation in README.md
- Included usage examples and component props
- Documented accessibility considerations

### 3. Backend Implementation ✅

#### Step 1: Express Server Setup ✅
```
backend/
├── src/
│   ├── server.js           # Main Express server with MongoDB Atlas connection (COMPLETED)
│   ├── config/
│   │   └── env.js          # Environment configuration with MongoDB Atlas URI (COMPLETED)
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware (COMPLETED)
│   │   └── error.js        # Error handling middleware (COMPLETED)
```

#### Step 2: MongoDB Atlas Integration ✅
- Set up MongoDB Atlas cluster for data persistence
- Configured secure connection with authentication
- Implemented robust error handling for database connection
- Added graceful degradation for server when database is unavailable

### 4. Frontend Integration

#### Step 1: Define Page Templates ✅
```
frontend/src/components/layout/
├── MainLayout.tsx          # Standard page layout with navigation (COMPLETED)
├── DashboardLayout.tsx     # User dashboard layout (COMPLETED)
└── AdminLayout.tsx         # Admin dashboard layout (COMPLETED)
```

#### Step 2: Implement Core Pages
```
frontend/src/pages/
├── index.tsx               # Home page (COMPLETED)
├── worksheets/             # Worksheet browsing and details (COMPLETED)
│   ├── index.tsx           # Worksheets browsing page (COMPLETED)
│   └── [id].tsx            # Worksheet detail page (COMPLETED)
├── pricing.tsx             # Subscription plans (COMPLETED)
├── dashboard/              # User dashboard (COMPLETED)
│   ├── index.tsx           # Main dashboard page (COMPLETED)
│   ├── worksheets/         # Dashboard worksheets section (COMPLETED)
│   │   ├── index.tsx       # Worksheets listing page (COMPLETED)
│   │   └── [id].tsx        # Worksheet detail page (COMPLETED)
│   ├── subscription.tsx    # Subscription management (COMPLETED)
│   └── profile.tsx         # User profile page (COMPLETED)
├── admin/                  # Admin dashboard (PARTIALLY COMPLETED)
│   ├── index.tsx           # Admin dashboard overview (COMPLETED)
│   └── users.tsx           # User management page (COMPLETED)
└── auth/                   # Authentication pages (COMPLETED)
    ├── login.tsx           # Login page (COMPLETED)
    ├── signup.tsx          # Signup page (COMPLETED)
    ├── reset-password.tsx  # Password reset page (COMPLETED)
    └── verify-email.tsx    # Email verification page (COMPLETED)
```

## Next Steps

### 1. Complete Remaining Core Pages ✅
```
frontend/src/pages/
├── worksheets/             # Public worksheets pages (COMPLETED)
│   ├── index.tsx           # Worksheets browsing page (COMPLETED)
│   └── [id].tsx            # Public worksheet detail page (COMPLETED)
├── pricing.tsx             # Subscription plans page (COMPLETED)
└── auth/                   # Authentication pages (COMPLETED)
    ├── login.tsx           # Login page (COMPLETED)
    ├── signup.tsx          # Signup page (COMPLETED)
    ├── reset-password.tsx  # Password reset page (COMPLETED)
    └── verify-email.tsx    # Email verification page (COMPLETED)
```

### 2. Complete Admin Dashboard
```
frontend/src/pages/admin/
├── worksheets/             # Worksheet management section (COMPLETED)
│   ├── index.tsx           # Worksheet listing page (COMPLETED)
│   ├── create.tsx          # Worksheet creation page (COMPLETED)
│   └── [id]/               # Worksheet detail pages (COMPLETED)
│       ├── index.tsx       # Worksheet detail view page (COMPLETED)
│       └── edit.tsx        # Worksheet editing page (COMPLETED)
├── subscriptions/          # Subscription management section (COMPLETED)
│   └── index.tsx           # Subscription listing page (COMPLETED)
├── subscription-plans/     # Subscription plan section (COMPLETED)
│   ├── index.tsx           # Subscription plan listing page (COMPLETED)
│   ├── create.tsx          # Subscription plan creation page (COMPLETED)
│   └── [id]/               # Subscription plan detail pages (COMPLETED)
│       └── edit.tsx        # Subscription plan editing page (COMPLETED)
├── users.tsx               # User management page (COMPLETED)
└── settings/               # Site settings section (COMPLETED)
    └── index.tsx           # Site settings page (COMPLETED)
```

### Admin Pages Implementation

The admin section of the application has been fully implemented with the following features and improvements:

#### Worksheet Creation Form
- **File Upload Handling**: Fixed multipart form data handling for worksheet file uploads
- **Form Data Package**: Replaced `formdata-node` with standard `form-data` package for better compatibility with `node-fetch`
- **File Streaming**: Implemented proper file streaming using `fs.createReadStream()` for efficient file uploads
- **Field Naming**: Updated field names to match backend expectations (file field named 'file')
- **API Integration**: Correctly forwards multipart form data to backend API at `/api/worksheets`
- **Error Handling**: Added comprehensive error handling and validation for file uploads

### 7. Admin Worksheet Management Interface Fixes ✅

#### Overview
Fixed critical issues in the admin worksheet management interface to ensure proper functioning of the View, Edit, and Delete operations.

#### Key Improvements

1. **View Button Functionality** ✅
   - Fixed worksheet detail page to properly fetch and display worksheet data
   - Improved authentication handling and error management
   - Added fallback to direct backend API calls when Next.js API routes fail
   - Enhanced logging for better debugging and error tracing

2. **Edit Button Functionality** ✅
   - Fixed worksheet edit form to properly load existing worksheet data
   - Implemented dual-fetch approach (try direct backend API first, then Next.js API)
   - Fixed form submission to handle file uploads correctly
   - Resolved issues with reading response body multiple times
   - Added proper redirection after successful updates

3. **Delete Button Functionality** ✅
   - Fixed delete functionality to use the correct API endpoint
   - Improved error handling and response parsing
   - Added detailed logging for debugging
   - Enhanced user feedback during and after deletion

4. **API Routes Enhancement** ✅
   - Added robust form data parsing with formidable for file uploads
   - Fixed type issues related to file handling in TypeScript
   - Implemented proper file streaming for uploads
   - Added comprehensive error handling and response parsing
   - Created separate handlers for GET, PUT, and DELETE operations

5. **Technical Implementation Details**
   - **API Endpoints**: 
     - Next.js API routes: `/api/admin/worksheets/[id]` for GET, PUT, DELETE operations
     - Direct backend API: `${NEXT_PUBLIC_API_URL}/api/worksheets/[id]` as fallback
   - **File Handling**: Used formidable for parsing multipart form data and form-data for constructing requests
   - **Authentication**: JWT tokens from localStorage sent in Authorization headers
   - **Error Handling**: Comprehensive error handling with detailed logging and user feedback
- **Subscription Plan Mapping**: Properly maps subscription plan IDs to subscription level strings
- **Token Management**: Ensures JWT token is correctly included in API requests
- **Redirect Timing**: Added slight delay before redirecting after successful submission to avoid React state errors

#### 1. Admin Users Page
- **API Integration**: Properly fetches user data from `/api/admin/users` endpoint
- **Authentication**: Includes authorization headers with JWT token from localStorage
- **Error Handling**: Robust error handling with appropriate UI feedback
- **Development Mode**: Falls back to localStorage data only in development mode
- **Type Safety**: Improved TypeScript typing for user data and state management

#### 2. Admin Worksheets Page
- **API Integration**: Fixed fetchWorksheets function to use proper API endpoint `/api/worksheets`
- **Response Handling**: Handles different API response formats robustly including `{ success: true, data: [...] }` structure
- **Development Mode**: Removed mock data dependency to always use real API data
- **Error States**: Improved loading and error state management with detailed console logging
- **Authorization**: Removed unnecessary authorization for public GET endpoints
- **Null Safety**: Added comprehensive null checks for all worksheet properties to prevent rendering errors
- **Fallback Values**: Implemented fallback values for missing data fields (title, subject, grade, difficulty)
- **Conditional Rendering**: Added conditional rendering for action buttons when worksheet ID is missing

#### 3. Admin Subscriptions Page
- **API Integration**: Uses environment variable for API URL with proper endpoint
- **Authorization**: Includes JWT token in authorization headers
- **Development Mode**: Provides mock subscription data in development
- **Error Handling**: Robust error handling with appropriate UI feedback

#### 4. Admin Settings Page
- **New Implementation**: Created new admin settings page to resolve 404 errors
- **Form Fields**: Includes site name, description, contact info, and feature toggles
- **API Integration**: Ready for backend API integration with `/api/admin/settings` endpoint
- **Development Mode**: Provides default settings data in development
- **UI Components**: Uses consistent UI components with the rest of the admin section

#### Common Improvements Across Admin Pages
- **API-First Approach**: All pages use backend API endpoints with no fallback to mock data in production
- **Environment Variables**: Consistent use of `NEXT_PUBLIC_API_URL` for API base URL
- **Authentication**: All admin API requests include authorization headers with JWT tokens
- **Error Handling**: Consistent error handling and loading state management
- **Development Experience**: Development mode support with realistic mock data
- **TypeScript**: Improved type safety across all admin pages

### 3. API Integration
- Replace all localStorage usage with API calls to the backend (NO localStorage fallbacks)
- Implement proper error handling and loading states
- Set up authentication with JWT tokens
- Connect to MongoDB database via the Express backend
- For new pages, use direct API calls without localStorage fallbacks

### 4. Authentication & Authorization
- Implement NextAuth.js for frontend authentication
- Set up JWT token handling
- Add role-based access control (RBAC)
- Create protected routes with Next.js middleware

### 5. Deployment Configuration

#### GitHub Repository Setup
- **Repository**: The project is hosted on GitHub at `https://github.com/d-rathor/PracticeGenius`
- **Branch Structure**: Main branch is used for production deployment
- **Git Configuration**:
  ```bash
  # Initialize Git repository
  git init
  
  # Add remote origin
  git remote add origin https://github.com/d-rathor/PracticeGenius.git
  
  # Create .gitignore file to exclude node_modules, .env files, etc.
  # Commit and push code to GitHub
  git add .
  git commit -m "Initial commit"
  git push -u origin main
  ```

#### Netlify Deployment
- **Deployment URL**: The application is deployed at `https://practicegeniusv2.netlify.app/`
- **Build Configuration**:
  - **Build command**: `npm run build`
  - **Publish directory**: `.next`
  - **Base directory**: `frontend`
- **Environment Variables**:
  - `NODE_VERSION`: `20.11.1` (Required for Next.js 15.3.3)
  - `NPM_FLAGS`: `--legacy-peer-deps` (For package compatibility)
  - `NEXT_PUBLIC_API_URL`: URL of the backend API

#### Netlify Configuration Files
- **netlify.toml**:
  ```toml
  [build]
    base = "frontend"
    command = "npm run build"
    publish = ".next"
  
  [build.environment]
    NODE_VERSION = "20.11.1"
    NPM_FLAGS = "--legacy-peer-deps"
  
  # Next.js specific settings
  [[plugins]]
    package = "@netlify/plugin-nextjs"
  
  # Handle all routes with Next.js
  [[redirects]]
    from = "/*"
    to = "/.netlify/functions/next"
    status = 200
  
  # Specific redirects for critical paths
  [[redirects]]
    from = "/profile"
    to = "/dashboard/profile"
    status = 301
    force = true
  ```

- **_redirects** (in public directory):
  ```
  /* /index.html 200
  ```

- **next.config.js** (Netlify-specific settings):
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // Enable output tracing for Netlify
    output: 'standalone',
    // Other Next.js configuration...
  };
  ```

#### Deployment Troubleshooting
- **TypeScript Errors**: Fixed various TypeScript errors that prevented successful builds:
  - Fixed property name mismatch in `withAuth.tsx` (`loading` → `isLoading`)
  - Fixed `totalPages` being used before declaration in `usePagination.ts`
  - Fixed API call missing data parameter in `setup-subscription-plans.tsx`
  - Fixed Card component usage in `profile.tsx` (using individual exports instead of dot notation)
  - Fixed type issues in `validation.ts` by ensuring boolean return types
  - Fixed `currentSubscription` type in `SubscriptionContext.tsx` to handle undefined values

- **Node.js Version**: Ensured Node.js 20.11.1 or higher is used for compatibility with Next.js 15.3.3

- **Routing Issues**: Implemented proper redirects in both Next.js configuration and Netlify configuration files

### 6. Testing & Quality Assurance
- Test all user flows and functionality
- Ensure responsive design works on all devices
- Verify API integration is working correctly
- Check for any remaining localStorage usage

## Important Development Notes

1. **LocalStorage Replacement**: All localStorage usage has been replaced with backend API calls except for JWT tokens.

2. **SSR Compatibility**: Always wrap browser API usage with `typeof window !== 'undefined'` checks for SSR compatibility.

3. **Middleware Redirects**: Implement both Next.js middleware redirects and explicit Netlify redirects for critical paths.

4. **Repository Structure**: The project has a dual repository structure:
   - Main repository at `C:\Devendra\Projects\PracticeGenius\` with remote "origin" pointing to GitLab and "github" pointing to GitHub.
   - Frontend subdirectory at `C:\Devendra\Projects\PracticeGenius\frontend\` is also a Git repository with remote "origin" pointing to GitHub.

5. **Command Execution**: Never use the `&&` operator to chain commands. Instead, use separate run_command calls for each command or navigate to the correct directory using the cwd parameter.

6. **API Connection**: The backend server binds to all interfaces (0.0.0.0) on port 8080 to ensure accessibility from all network interfaces.

7. **Data Migration**: There is no existing data to migrate; the solution is implemented step by step with a clean approach.

8. **Subscription Checking**: Run the subscription-checker.js script periodically to update expired subscriptions.

## Scripts

### Backend Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon
- `npm run start:server` - Start the server with environment setup
- `npm run seed` - Seed the database with initial data
- `npm run check-subscriptions` - Check and update expired subscriptions

### Frontend Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the Next.js application
- `npm run start` - Start the Next.js production server
- `npm run start:dev` - Start the development server with environment setup
- `npm run api:dev` - Start both frontend and backend servers concurrently
