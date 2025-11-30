# HeartSmiles Frontend

Frontend application for HeartSmiles Youth Success App built with React.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

The app will run on `http://localhost:3000` (or next available port).

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_BASE_URL=http://localhost:5001/api
PORT=3000
```

For production deployment, set `REACT_APP_API_BASE_URL` to your deployed backend URL.

## Deployment

This frontend is deployed to Vercel. See deployment settings in the Vercel dashboard.

## Project Structure

```
src/
├── pages/          # Page components
├── components/     # Reusable components
├── context/        # React Context providers
├── services/       # API services
├── layouts/        # Layout components
└── routes/         # Route configurations
```
