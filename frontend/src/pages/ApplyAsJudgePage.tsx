import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Card,
  CardContent,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  Gavel as JudgeIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ApplyAsJudgePage = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Automatically submit the request when page loads and user is authenticated
    if (user && hackathonId) {
      handleApplyAsJudge();
    }
  }, [user, hackathonId]);

  const handleApplyAsJudge = async () => {
    if (!user) {
      setError('You must be logged in to apply as a judge.');
      return;
    }

    if (!hackathonId) {
      setError('Invalid hackathon ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await hackathonRegistrationAPI.joinHackathon({
        userId: user.id,
        hackathonId: parseInt(hackathonId),
        role: 'JUDGE'
      });

      setSuccess(true);
      
      // Redirect to hackathon page after 3 seconds
      setTimeout(() => {
        navigate(`/hackathons/${hackathonId}`);
      }, 3000);

    } catch (err: any) {
      console.error('Judge application failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Application failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <JudgeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Authentication Required
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
              You need to be logged in to apply as a judge
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Please sign in to your account to submit your judge application for this hackathon.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login', { state: { returnTo: `/hackathons/${hackathonId}/apply-judge` } })}
                sx={{ px: 4, py: 1.5 }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register', { state: { returnTo: `/hackathons/${hackathonId}/apply-judge` } })}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <SuccessIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
              Judge Request Sent! 🎉
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thank you for your interest in judging, {user?.username || user?.email}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your judge request has been sent to the hackathon organizers.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              The organizers will review your request and notify you of their decision.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Redirecting to hackathon details in 3 seconds...
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/hackathons/${hackathonId}`)}
                sx={{ mr: 2 }}
              >
                Go to Hackathon
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/hackathons')}
              >
                View All Hackathons
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sending Judge Request...
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Please wait while we submit your request to become a judge for this hackathon.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <JudgeIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Request Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => handleApplyAsJudge()}
                disabled={loading}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/hackathons/${hackathonId}`)}
              >
                Back to Hackathon
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return null; // This shouldn't be reached, but just in case
};

export default ApplyAsJudgePage; 