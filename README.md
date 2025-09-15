# SmartClinic Scheduler

A smart scheduling system for medical clinics that integrates with Google Calendar and provides intelligent appointment slot suggestions.

## Features

- **Smart Scheduling**: Automatically suggests optimal appointment slots based on doctor availability, service duration, and patient preferences
- **Google Calendar Integration**: OAuth2 connection to sync appointments with Google Calendar
- **Real-time Management**: Doctor dashboard to view, approve, and manage appointment requests
- **Intelligent Algorithms**: Considers buffers, availability windows, and minimizes scheduling conflicts
- **User Authentication**: JWT-based authentication for secure access

## Architecture

### Backend (Node.js + NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Calendar**: Google Calendar API integration
- **Smart Scheduling**: Custom algorithm for slot generation

### Frontend (React)
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **API Client**: Axios with interceptors

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Cloud Project with Calendar API enabled

### Environment Setup

1. **Backend Configuration**
   Create `backend/.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/smartclinic"
   JWT_SECRET="your-super-secret-jwt-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/auth/google/callback"
   PORT=3000
   NODE_ENV=development
   ```

2. **Google OAuth Setup**
   - Create a Google Cloud Project
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

### Installation & Running

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

3. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run start:dev

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api

## Usage

### For Doctors
1. **Register/Login**: Create an account or sign in
2. **Connect Google Calendar**: Link your Google Calendar for automatic sync
3. **Set Availability**: Define your working hours and days
4. **Create Services**: Add services with duration and buffer times
5. **Manage Appointments**: 
   - View pending appointment requests
   - Review suggested time slots
   - Approve appointments with one click
   - Cancel or reschedule as needed

### For Patients (via API)
1. **Request Appointment**: Submit preferred time ranges and service
2. **Receive Suggestions**: System generates optimal time slots
3. **Confirmation**: Doctor approves and appointment is added to calendar

## Smart Scheduling Algorithm

The system uses an intelligent algorithm that:

1. **Analyzes Availability**: Checks doctor's working hours and existing appointments
2. **Considers Preferences**: Matches patient's preferred time ranges
3. **Applies Buffers**: Adds appropriate buffer time between appointments
4. **Scores Slots**: Ranks suggestions based on multiple factors:
   - Proximity to preferred times
   - Optimal scheduling patterns
   - Minimal gaps and conflicts
5. **Returns Top Suggestions**: Provides best 3-5 options for approval

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment request
- `PUT /api/appointments/:id/confirm` - Confirm appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Calendar Integration
- `GET /api/calendar/auth-url` - Get Google OAuth URL
- `POST /api/calendar/connect` - Connect Google Calendar
- `POST /api/calendar/sync` - Sync calendar events

## Technology Stack

- **Backend**: Node.js, NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Authentication**: JWT, Google OAuth2
- **API Integration**: Google Calendar API
- **Development**: ESLint, Prettier, Nodemon

## License

This project is licensed under the ISC License.

Un sistema de agendamiento para clínicas que sugiere automáticamente los mejores huecos (minimiza tiempos muertos, respeta buffers y preferencias), el doctor aprueba en un clic y se sincroniza con Google Calendar. Construido para crecer y venderse.
