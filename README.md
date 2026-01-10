# License Plate Tracker

A fun web application to track and compete with friends to collect license plates from all 50 US states and territories.

## Features

- **User Authentication** - Supabase Auth with email/password
- **Friend Groups** - Create or join groups to compete with friends
- **License Plate Logging**
  - Upload photos with Supabase Storage
  - Manual entry of state/territory
  - Vanity plate flag (+2 bonus points)
  - Special/commemorative plates (+3 bonus points)
- **Real-time Leaderboard** - Live rankings, states collected, and points
- **Interactive Map** - Visual progress tracking of all 56 states/territories
- **Photo Gallery** - View all collected license plates with details

## Tech Stack

Built with the **Vercel-optimized stack**:

- **Next.js 14** - React framework with App Router and TypeScript
- **Supabase** - Backend-as-a-Service for auth, database, and storage
  - PostgreSQL database with Row Level Security
  - Built-in authentication
  - Storage for license plate photos
  - Real-time subscriptions
- **Vercel** - Deployment platform (optimized for Next.js)

## Getting Started

### Prerequisites
- Node.js 18+ or higher
- Supabase account (free tier available)
- Vercel account for deployment (optional)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the database schema in your Supabase SQL editor:
   - Copy the contents of `supabase-schema.sql`
   - Paste and execute in Supabase SQL Editor

3. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the `Project URL` and `anon public` key

### 2. Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd license-plate-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Deploy to Vercel

1. Push your code to GitHub

2. Import project in [Vercel](https://vercel.com)

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy! Vercel will automatically build and deploy your app.

## Project Structure

```
license-plate-tracker/
├── app/                     # Next.js App Router pages
│   ├── dashboard/          # Dashboard page
│   ├── groups/[id]/        # Group detail page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── AddPlateModal.tsx
│   ├── DashboardClient.tsx
│   ├── Gallery.tsx
│   ├── GroupCard.tsx
│   ├── Leaderboard.tsx
│   └── MapView.tsx
├── lib/
│   └── supabase/          # Supabase client setup
├── types/                  # TypeScript types
├── middleware.ts           # Next.js middleware for auth
└── supabase-schema.sql    # Database schema

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
