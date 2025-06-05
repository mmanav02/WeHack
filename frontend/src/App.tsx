import { Box, Container, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HackathonsPage from './pages/HackathonsPage';
import HackathonRegistrationPage from './pages/HackathonRegistrationPage';
import CreateHackathonPage from './pages/CreateHackathonPage';
import JudgeRequestsPage from './pages/JudgeRequestsPage';
import EditSubmissionPage from './pages/EditSubmissionPage';
import SubmitScorePage from './pages/SubmitScorePage';
import HackathonDetailsPage from './pages/HackathonDetailsPage';
import SubmissionDetailsPage from './pages/SubmissionDetailsPage';
import TestConnection from './pages/TestConnection';
import VideoBackground from './components/VideoBackground';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CssBaseline />
      <VideoBackground>
        <Router>
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              color: 'white', // optional: for better visibility over video
            }}
          >
            <Navbar />
            <Container
              maxWidth="lg"
              sx={{ paddingY: 4, flexGrow: 1 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<SignUpPage />} />
                <Route path="/hackathons" element={<HackathonsPage />} />
                <Route path="/hackathons/:hackathonId/register" element={<HackathonRegistrationPage />} />
                <Route path="/create-hackathon" element={<CreateHackathonPage />} />
                <Route path="/hackathons/:hackathonId/judge-requests" element={<JudgeRequestsPage />} />
                <Route path="/hackathons/:hackathonId/submissions/:submissionId/edit" element={<EditSubmissionPage />} />
                <Route path="/submissions/:submissionId/score" element={<SubmitScorePage />} />
                <Route path="/hackathons/:hackathonId" element={<HackathonDetailsPage />} />
                <Route path="/submissions/:submissionId" element={<SubmissionDetailsPage />} />
                <Route path="/test-connection" element={<TestConnection />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </VideoBackground>
    </AuthProvider>
  );
};

export default App;
