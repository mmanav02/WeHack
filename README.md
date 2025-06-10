# WeHack 🚀

A comprehensive hackathon management platform that enables organizers to create, manage, and run hackathons while providing participants with tools to submit projects, form teams, and engage with the community.

![WeHack Platform](https://img.shields.io/badge/Platform-Hackathon%20Management-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-6db33f)
![Database](https://img.shields.io/badge/Database-MySQL-4479a1)

## ✨ Features

### 🏆 **Core Functionality**
- **Hackathon Management**: Create, edit, and manage hackathons with detailed information
- **User Authentication**: Secure login/signup system with role-based access
- **Project Submission**: Advanced submission system with file uploads and validation
- **Team Management**: Form teams, invite members, and collaborate
- **Judging System**: Comprehensive judge management and scoring system
- **Real-time Comments**: Nested comment system with reply functionality

### 🎯 **User Roles**
- **Organizers**: Create hackathons, manage participants, oversee judging
- **Participants**: Join hackathons, submit projects, form teams
- **Judges**: Evaluate submissions, provide scores and feedback

### 🔥 **Advanced Features**
- **Leaderboard**: Real-time ranking and scoring
- **File Management**: Secure file upload and storage
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Theme**: Customizable UI experience
- **Search & Filter**: Advanced hackathon and project discovery

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API communication

### **Backend**
- **Spring Boot 3** with Java
- **Spring Security** for authentication
- **Spring Data JPA** for database operations
- **MySQL** database
- **Maven** for dependency management

### **Design Patterns**
- **Builder Pattern** for submission creation
- **Composite Pattern** for hierarchical comments
- **Observer Pattern** for real-time updates
- **Decorator Pattern** for enhanced logging

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **Java** (v17+ required)
- **MySQL** (v8.0+ recommended)
- **Maven** (v3.6+ recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/wehack.git
cd wehack
```

### 2. Frontend Build
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build the frontend for production
npm run build
```

### 3. Backend Setup & Run
```bash
# Navigate to backend directory
cd backend

# Configure database in application.properties
# Update database URL, username, and password

# Install dependencies and run (serves both frontend and backend)
./mvnw spring-boot:run
```

### 4. Access the Application
- **Application**: http://localhost:8080
- **API Endpoints**: http://localhost:8080/api/*

> **Note**: The Spring Boot backend serves the built React frontend, so the entire application runs on a single port (8080).

### Development Mode (Optional)
For development with hot reload:
```bash
# Terminal 1 - Frontend development server
cd frontend
npm run dev     # Runs on localhost:5173

# Terminal 2 - Backend server
cd backend
./mvnw spring-boot:run     # Runs on localhost:8080
```

## 📁 Project Structure

```
WeHack/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API service layers
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/we/hack/
│   │       ├── controller/ # REST controllers
│   │       ├── service/    # Business logic
│   │       ├── model/      # JPA entities
│   │       ├── repository/ # Data access layer
│   │       └── config/     # Configuration classes
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
└── README.md
```

## 🔧 Configuration

### Database Configuration
Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/wehack
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Environment Variables
Create `.env` file in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=WeHack
```

## 🌟 Key Components

### **Submission System**
- Advanced project submission with validation
- File upload support (ZIP, PDF, docs)
- Draft saving functionality
- Builder pattern implementation

### **Comment System**
- Hierarchical nested comments
- Real-time reply functionality
- Composite pattern for comment tree structure
- Modern dark theme UI

### **Team Management**
- Team creation and invitation system
- Member role management
- Collaborative project submission

### **Judge Dashboard**
- Comprehensive scoring interface
- Submission evaluation tools
- Real-time feedback system

## 📚 API Documentation

### **Authentication Endpoints**
```
POST /auth/login          # User login
POST /auth/signup         # User registration
POST /auth/logout         # User logout
```

### **Hackathon Endpoints**
```
GET    /hackathons        # Get all hackathons
POST   /hackathons        # Create hackathon
GET    /hackathons/{id}   # Get hackathon details
PUT    /hackathons/{id}   # Update hackathon
DELETE /hackathons/{id}   # Delete hackathon
```

### **Submission Endpoints**
```
POST /submissions         # Submit project
GET  /submissions/{id}    # Get submission details
PUT  /submissions/{id}    # Update submission
```

### **Comment Endpoints**
```
GET  /comments/{hackathonId}  # Get comments
POST /comments                # Add comment/reply
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for users
- **Input Validation**: Comprehensive server-side validation
- **File Upload Security**: Safe file handling and storage
- **SQL Injection Prevention**: Parameterized queries

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
./mvnw test
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
./mvnw clean package
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Style
- Follow TypeScript/React best practices
- Use consistent naming conventions
- Write comprehensive comments
- Include unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** for the excellent React components
- **Spring Boot** for the robust backend framework
- **React Community** for inspiration and best practices
- **Open Source Contributors** who made this project possible

## 📞 Support

For support, email support@wehack.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] **Mobile App** - React Native implementation
- [ ] **Real-time Chat** - WebSocket integration
- [ ] **Advanced Analytics** - Detailed hackathon insights
- [ ] **API Gateway** - Microservices architecture
- [ ] **CI/CD Pipeline** - Automated deployment
- [ ] **Multi-language Support** - Internationalization

---

**Made with ❤️ by the WeHack Team** 