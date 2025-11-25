# Hidden Gems - Travel Destination Platform

A modern web application for discovering and sharing hidden travel destinations across Indonesia.

## Features

- 🗺️ **Destination Discovery**: Browse verified travel destinations
- ⭐ **Reviews & Ratings**: Share experiences and rate destinations
- 🔍 **Advanced Search**: Find destinations by name, location, rating
- 📱 **Responsive Design**: Mobile-first, works on all devices
- 🔐 **User Authentication**: Secure Firebase authentication
- 👑 **Admin Dashboard**: Moderate and approve destinations
- 🎨 **Modern UI**: Beautiful design with Tailwind CSS & Framer Motion

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Lucide Icons
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth + Firestore)
- **State Management**: TanStack Query v5
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd hidden-gems-simple
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Firebase:**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config

4. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Add your Firebase credentials to `.env.local`:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

   # For admin scripts
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your app.

## Admin Account Setup

Create your first admin account to manage destinations:

```bash
# Option 1: Interactive mode
npm run create-admin

# Option 2: With environment variables
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure123 ADMIN_NAME="Admin User" npm run create-admin

# Option 3: Promote existing user
npm run make-admin
```

See [scripts/README.md](scripts/README.md) for detailed documentation.

## Project Structure

```
src/
├── actions/          # Server actions (API layer)
│   ├── auth.ts      # Authentication actions
│   ├── gems.ts      # Destination CRUD operations
│   └── users.ts     # User management
├── app/             # Next.js app router pages
│   ├── (auth)/      # Auth pages (login, register)
│   ├── (dashboard)/ # Protected dashboard
│   └── gems/        # Destination pages
├── components/      # React components
│   ├── pages/       # Page-specific components
│   ├── shared/      # Reusable components
│   └── ui/          # UI primitives (shadcn)
├── features/        # Feature-based hooks
│   ├── auth/        # Auth hooks
│   ├── gems/        # Gem hooks
│   └── users/       # User hooks
├── lib/             # Utilities
│   ├── auth/        # JWT utilities
│   └── firebase/    # Firebase config
├── schemas/         # Zod validation schemas
└── types/           # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run create-admin` - Create new admin account
- `npm run make-admin` - Promote user to admin

## API Documentation

### Server Actions

All server actions return a standardized response:

```typescript
interface ServerActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
```

**Gems Actions** (`src/actions/gems.ts`):

- `getGemsAction(filters, pagination)` - Get paginated gems
- `getGemByIdAction(id)` - Get single gem
- `searchGemsAction(query, limit)` - Search gems
- `createGemAction(data)` - Create new gem
- `updateGemAction(id, data)` - Update gem
- `deleteGemAction(id)` - Delete gem
- `getGemReviewsAction(gemId, limit)` - Get reviews
- `createReviewAction(data)` - Create review
- `adminApproveGemAction(id, verifiedBy)` - Approve gem
- `adminRejectGemAction(id, reason)` - Reject gem
- `getGemStatsAction()` - Get statistics

**Auth Actions** (`src/actions/auth.ts`):

- `loginAction(data)` - User login
- `registerAction(data)` - User registration
- `logoutAction()` - User logout
- `forgotPasswordAction(data)` - Password reset

**User Actions** (`src/actions/users.ts`):

- `getUsersAction(filters, pagination)` - Get paginated users
- `getUserByIdAction(uid)` - Get single user
- `searchUsersAction(query, limit)` - Search users
- `updateUserRoleAction(uid, role)` - Update role
- `updateUserStatusAction(uid, status, reason)` - Ban/unban user
- `getUserStatsAction()` - Get statistics

## Features in Detail

### Search & Filtering

- Real-time search across gem names and descriptions
- Filter by rating (4+ stars)
- Sort by rating, date, or name
- URL-based search params for shareable links

### Pagination

- Server-side pagination (10-20 items per page)
- "Load more" or page-based navigation
- Optimized queries with Firestore limits

### Authentication

- Email/password authentication
- JWT tokens (15min access, 7 days refresh)
- Email verification
- Password reset
- Role-based access control (user/admin)
- Ban/unban functionality

### Caching Strategy

- TanStack Query for data fetching
- Smart cache invalidation
- 5-minute stale time for lists
- 2-minute stale time for stats
- Window focus refetch

## Security

- HttpOnly cookies for tokens
- Server-side validation with Zod
- Firestore security rules
- Environment variable protection
- JWT token verification
- CSRF protection

## Performance

- Server-side rendering (SSR)
- Optimistic UI updates
- Image optimization
- Code splitting
- Lazy loading
- Memoization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

- Create an issue on GitHub
- Check [BACKEND_IMPROVEMENTS.md](BACKEND_IMPROVEMENTS.md) for technical details
- Review [scripts/README.md](scripts/README.md) for admin setup

---

Built with ❤️ using Next.js and Firebase
