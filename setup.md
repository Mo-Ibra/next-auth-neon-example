# Authentication System Setup Guide

This is a complete modern authentication system using Next.js 16, Auth.js v5, Prisma, Neon PostgreSQL, and Nodemailer.

## Features

- Email/Password authentication with secure password hashing
- Google OAuth integration
- Email verification via Nodemailer
- Protected routes and middleware
- JWT session management
- Type-safe database with Prisma

## Prerequisites

- Node.js 18+
- Neon PostgreSQL account
- Google Cloud project for OAuth
- Gmail account for email verification

## Installation

1. Install dependencies:

   ```bash
   npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client nodemailer
   npm install -D @types/nodemailer
   ```

2. Generate Auth.js secret:

   ```bash
   npx auth secret
   ```

3. Set up environment variables in `.env.local` using `.env.local.example` as a template.

## Configuration Steps

### 1. Database Setup (Neon PostgreSQL)

1. Get your Neon PostgreSQL connection string
2. Add it to `DATABASE_URL` in `.env.local`
3. Run migrations:
  ```bash
  npx prisma generate
  npx prisma db push
  ```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy `Client ID` and `Client Secret` to `.env.local`:
  ```
  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  ```

### 3. Gmail Setup for Email Verification

1. Enable 2-Step Verification on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Add to `.env.local`:
  ```
  GMAIL_USER=your_email@gmail.com
  GMAIL_PASSWORD=your_app_password
  ```

**Note**: Use an App Password, not your regular Gmail password.

## File Structure

```
├── auth.ts # Auth.js configuration with Google OAuth
├── middleware.ts # Session middleware
├── prisma/
│ └── schema.prisma # Database schema with email verification model
├── lib/
│ ├── prisma.ts # Prisma client singleton
│ ├── password.ts # Password hashing utilities
│ └── email.ts # Nodemailer email service
├── app/
│ ├── api/auth/
│ │ ├── [...nextauth]/route.ts # Auth.js route handler
│ │ ├── register/route.ts # User registration with email verification
│ │ └── verify-email/route.ts # Email verification endpoint
│ ├── login/page.tsx # Login page with Google OAuth button
│ ├── signup/page.tsx # Signup page with email verification
│ ├── verify-email/page.tsx # Email verification confirmation page
│ └── dashboard/page.tsx # Protected dashboard
└── components/auth/
├── login-form.tsx # Login form component
└── signup-form.tsx # Signup form component
```

## Usage

### Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to start.

### User Flow

**Email/Password Registration:**

1. Go to `/signup`
2. Enter name, email, and password
3. Account is created with unverified email
4. Verification email is sent
5. Click the link in the email to verify
6. Login at `/login` with credentials

**Google OAuth:**

1. Go to `/login`
2. Click "Sign in with Google"
3. Authorize the app
4. Email is auto-verified through Google
5. Redirected to `/dashboard`

### Accessing Protected Routes

- `/dashboard` - User dashboard (requires verified email for credentials login)
- Protected via middleware and page-level auth checks

## Database Models

### User

- `id`: Unique identifier
- `name`: User's full name
- `email`: Email address (unique)
- `emailVerified`: Email verification timestamp
- `password`: Hashed password (null for OAuth users)
- `image`: Profile picture URL

### EmailVerificationToken

- `id`: Unique identifier
- `email`: Email to verify
- `token`: Verification token
- `expires`: Token expiration time

### Account & Session

- Auth.js models for OAuth and session management

## Environment Variables

| Variable               | Description                      | Example                 |
| ---------------------- | -------------------------------- | ----------------------- |
| `DATABASE_URL`         | Neon PostgreSQL connection       | `postgresql://...`      |
| `AUTH_SECRET`          | Generated with `npx auth secret` | Generated               |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID           | From Google Cloud       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret       | From Google Cloud       |
| `GMAIL_USER`           | Gmail address for sending emails | `user@gmail.com`        |
| `GMAIL_PASSWORD`       | Gmail app password               | From Gmail security     |
| `AUTH_URL`             | Application URL                  | `http://localhost:3000` |

## Security Notes

- Passwords are hashed using PBKDF2 with salt
- JWT tokens are signed with AUTH_SECRET
- Email verification tokens expire after 24 hours
- Use environment variables for all secrets
- Row-level security can be added to Prisma relations
- Credentials are only accepted for verified emails

## Troubleshooting

**"Invalid verification token"**

- Token has expired (24 hour limit)
- Token doesn't match the email
- Token was already used

**"Email already in use"**

- An account with this email already exists
- Try logging in or use password reset

**Gmail not sending emails**

- Verify GMAIL_USER and GMAIL_PASSWORD are correct
- Use App Password, not regular password
- Check 2-Step Verification is enabled

**Google OAuth not working**

- Verify redirect URIs match in Google Cloud Console
- Check CLIENT_ID and CLIENT_SECRET are correct
- Clear browser cookies and try again

## Deployment

1. Update `AUTH_URL` to your production domain
2. Add environment variables to your hosting platform
3. Update Google OAuth redirect URIs for production domain
4. Use production-ready email service (SendGrid, etc.)
5. Ensure database backups are configured