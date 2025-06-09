# Practice Genius Frontend

This is the frontend application for Practice Genius, an educational platform designed to provide worksheets and learning materials for students.

## Tech Stack

- **Framework**: Next.js 15+
- **Language**: TypeScript
- **Authentication**: NextAuth.js with JWT
- **API Communication**: Axios
- **Styling**: CSS Modules / Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20.11.1 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/practice-genius-frontend.git
cd practice-genius-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` and update the values

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/components/` - Reusable UI components
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/pages/` - Next.js page components
- `src/services/` - API service layer
- `src/styles/` - Global styles and theme
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Deployment

This project is configured for deployment on Netlify:

- The `netlify.toml` file contains the deployment configuration
- Ensure Node.js version is set to 20.11.1 or higher
- All client-side code that uses browser APIs (like localStorage) must be wrapped in `typeof window !== 'undefined'` checks

## API Integration

The frontend communicates with the backend API:

- Default API URL: `http://localhost:8080` (development)
- Production API URL: Set via environment variables
- All API calls are made through service modules in `src/services/`
