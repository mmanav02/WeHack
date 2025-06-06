import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
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
import TestConnection from './pages/TestConnection';
import VideoBackground from './components/VideoBackground';

// Lazy-loaded components for better performance
const JudgeRequestsPage = React.lazy(() => import('./pages/JudgeRequestsPage'));
const EditSubmissionPage = React.lazy(() => import('./pages/EditSubmissionPage'));
const SubmitScorePage = React.lazy(() => import('./pages/SubmitScorePage'));
const SubmitProjectPage = React.lazy(() => import('./pages/SubmitProjectPage'));
const HackathonDetailsPage = React.lazy(() => import('./pages/HackathonDetailsPage'));
const SubmissionDetailsPage = React.lazy(() => import('./pages/SubmissionDetailsPage'));
const SubmissionsListPage = React.lazy(() => import('./pages/SubmissionsListPage'));
const JudgeManagementPage = React.lazy(() => import('./pages/JudgeManagementPage'));
const TeamManagementPage = React.lazy(() => import('./pages/TeamManagementPage'));
const ApplyAsJudgePage = React.lazy(() => import('./pages/ApplyAsJudgePage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="h6" color="textSecondary">
      Loading page...
    </Typography>
  </Box>
);

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
                <Route path="/hackathons/:hackathonId/submit-project" element={<Suspense fallback={<PageLoader />}><SubmitProjectPage /></Suspense>} />
                <Route path="/create-hackathon" element={<CreateHackathonPage />} />
                <Route path="/hackathons/:hackathonId/judge-requests" element={<Suspense fallback={<PageLoader />}><JudgeRequestsPage /></Suspense>} />
                <Route path="/hackathons/:hackathonId/submissions/:submissionId/edit" element={<Suspense fallback={<PageLoader />}><EditSubmissionPage /></Suspense>} />
                <Route path="/submissions" element={<Suspense fallback={<PageLoader />}><SubmissionsListPage /></Suspense>} />
                <Route path="/submissions/:submissionId/score" element={<Suspense fallback={<PageLoader />}><SubmitScorePage /></Suspense>} />
                <Route path="/hackathons/:hackathonId" element={<Suspense fallback={<PageLoader />}><HackathonDetailsPage /></Suspense>} />
                <Route path="/submissions/:submissionId" element={<Suspense fallback={<PageLoader />}><SubmissionDetailsPage /></Suspense>} />
                <Route path="/test-connection" element={<TestConnection />} />
                <Route path="/hackathons/:hackathonId/judge-management" element={<Suspense fallback={<PageLoader />}><JudgeManagementPage /></Suspense>} />
                <Route path="/hackathons/:hackathonId/team-management" element={<Suspense fallback={<PageLoader />}><TeamManagementPage /></Suspense>} />
                <Route path="/hackathons/:hackathonId/apply-judge" element={<Suspense fallback={<PageLoader />}><ApplyAsJudgePage /></Suspense>} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </VideoBackground>
    </AuthProvider>
  );
};

export default App;
