import { Box, Container, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HackathonsPage from './pages/HackathonsPage';
import HackathonRegistrationPage from './pages/HackathonRegistrationPage';
import VideoBackground from './components/VideoBackground';

const App: React.FC = () => {
  return (
    <>
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
              </Routes>
            </Container>
          </Box>
        </Router>
      </VideoBackground>
    </>
  );
};

export default App;
