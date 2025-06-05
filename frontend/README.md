# WeHack Frontend

A modern React application for hackathon management built with TypeScript, Material-UI, and Vite.

## Features

- User authentication (login/register)
- Hackathon browsing and management
- Submission handling
- Judging system
- Real-time updates
- Responsive design

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API communication
- **Vite** for fast development and building
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Backend Integration

This frontend is designed to work with the Spring Boot backend. The API base URL is configured to `http://localhost:8080`.

### Important: CORS Configuration Required

**For your backend team:** The backend needs CORS configuration to allow requests from the frontend. Add this configuration to your Spring Boot application:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

Or add this annotation to your controllers:
```java
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
```

### API Endpoints

The frontend expects these endpoints to be available:

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Hackathons
- `GET /hackathons/iterator` - Get all hackathons
- `POST /hackathons/create` - Create new hackathon
- `DELETE /hackathons/delete` - Delete hackathon
- `PUT /hackathons/{id}/publish` - Publish hackathon
- `PUT /hackathons/{id}/judging` - Start judging phase
- `PUT /hackathons/{id}/complete` - Complete hackathon
- `GET /hackathons/{id}/leaderboard` - Get leaderboard

#### Submissions
- `POST /submissions/{hackathonId}/user/{userId}` - Submit entry
- `PUT /submissions/{hackathonId}/user/{userId}/submission/{submissionId}` - Edit submission
- `GET /submissions/hackathon/{hackathonId}` - Get submissions by hackathon
- `GET /submissions/user/{userId}` - Get user submissions
- `GET /submissions/{submissionId}` - Get specific submission

#### Other APIs
- Comments, Judge Scores, Hackathon Roles, Analytics (see `src/services/api.ts` for complete list)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (AuthContext)
├── pages/              # Page components
├── services/           # API services
├── assets/             # Static assets
└── main.tsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env` file in the root directory if you need to customize the API URL:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Follow Material-UI design patterns
4. Test your changes thoroughly

## Notes for Backend Team

- Ensure CORS is properly configured
- The frontend expects JSON responses
- User authentication should return user object with `id`, `name`, and `email`
- File uploads use `multipart/form-data`
- All endpoints should handle errors gracefully and return appropriate HTTP status codes
