# License Plate Tracker

A fun web application to track and compete with friends to collect license plates from all 50 US states and territories.

## Features

- **User Authentication** - Secure sign up and login system
- **Friend Groups** - Create or join groups to compete with friends
- **License Plate Logging**
  - Upload photos of license plates
  - Manual entry of state/territory
  - Vanity plate flag (+2 bonus points)
  - Special/commemorative plates (+3 bonus points)
- **Leaderboard** - Track rankings, states collected, and points
- **Interactive Map** - Visual progress tracking of all 50 states + territories
- **Photo Gallery** - View all collected license plates with details

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- SQLite database
- JWT authentication
- Multer for file uploads

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API calls
- CSS for styling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd license-plate-tracker
```

2. Install all dependencies:
```bash
npm run install:all
```

This will install dependencies for the root, frontend, and backend.

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

#### Running Separately

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the `backend` directory (use `.env.example` as template):

```env
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
DATABASE_PATH=./database.sqlite
UPLOAD_PATH=./uploads
```

## Project Structure

```
license-plate-tracker/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── utils/           # Helper functions
│   │   ├── database.ts      # Database initialization
│   │   ├── server.ts        # Express server setup
│   │   └── types.ts         # TypeScript types
│   ├── uploads/             # Uploaded images
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context (auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── types.ts         # TypeScript types
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `POST /api/groups/join` - Join group by code
- `GET /api/groups/:groupId/members` - Get group members

### License Plates
- `POST /api/plates` - Add new license plate (with photo upload)
- `GET /api/plates/group/:groupId` - Get all plates in group
- `GET /api/plates/group/:groupId/user` - Get user's plates in group
- `GET /api/plates/group/:groupId/user/states` - Get states collected by user

### Leaderboard
- `GET /api/leaderboard/:groupId` - Get group leaderboard
- `GET /api/leaderboard/:groupId/user/:userId` - Get user stats

## How to Play

1. **Sign Up** - Create an account
2. **Create or Join a Group** - Start a new group or join with a 6-character code
3. **Spot License Plates** - Take photos of license plates from different states
4. **Log Your Finds** - Upload photos and mark vanity/special plates for bonus points
5. **Compete** - Track your progress on the leaderboard and map
6. **Collect All States** - Race to be the first to collect all 50 states + territories!

## Scoring

- Standard plate: 1 point
- Vanity plate: +2 bonus points (3 total)
- Special/commemorative plate: +3 bonus points (4 total)
- Vanity + Special: +5 bonus points (6 total)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
