import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Group as GroupIcon, Celebration as CelebrationIcon, Login as LoginIcon } from '@mui/icons-material';
import { hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HackathonRegistrationPage = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamNameError, setTeamNameError] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 HackathonRegistrationPage - Auth Debug Info:');
    console.log('- authLoading:', authLoading);
    console.log('- user:', user);
    console.log('- user exists:', !!user);
    console.log('- localStorage user:', localStorage.getItem('user'));
  }, [user, authLoading]);

  // Check authentication on component mount and when auth state changes
  useEffect(() => {
    console.log('🔒 Authentication check triggered');
    console.log('- authLoading:', authLoading, '- user:', !!user);
    
    if (!authLoading) {
      if (!user) {
        console.log('❌ No user found, should show auth dialog');
        setShowAuthDialog(true);
      } else {
        console.log('✅ User found:', user.email);
        setShowAuthDialog(false);
      }
    }
  }, [user, authLoading]);

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
    if (teamNameError) {
      setTeamNameError('');
    }
  };

  const validateForm = () => {
    if (!teamName.trim()) {
      setTeamNameError('Team name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission attempt');
    console.log('- user:', !!user);
    
    // Double-check authentication before submitting
    if (!user) {
      console.log('❌ Submit blocked - no user');
      setShowAuthDialog(true);
      return;
    }
    
    if (!validateForm()) return;
    
    if (!hackathonId) {
      setError('Invalid hackathon ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting registration process...');
      
      // Step 1: Join the hackathon as a participant
      console.log('Step 1: Joining hackathon...');
      const joinResponse = await hackathonRegistrationAPI.joinHackathon({
        userId: user.id,
        hackathonId: parseInt(hackathonId),
        role: 'PARTICIPANT'
      });
      console.log('Joined hackathon successfully:', joinResponse.data);

      // Step 2: Create a team
      console.log('Step 2: Creating team...');
      const teamResponse = await hackathonRegistrationAPI.createTeam({
        name: teamName.trim(),
        userId: user.id,
        hackathonId: parseInt(hackathonId)
      });
      console.log('Team created successfully:', teamResponse.data);

      setSuccess(true);
      
      // Redirect to hackathon details page after 3 seconds
      setTimeout(() => {
        navigate(`/hackathons/${hackathonId}`);
      }, 3000);

    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnTo: `/hackathons/${hackathonId}/register` } });
  };

  const handleSignUpRedirect = () => {
    navigate('/register', { state: { returnTo: `/hackathons/${hackathonId}/register` } });
  };

  // Show loading state while checking authentication
  if (authLoading) {
    console.log('🔄 Showing auth loading state');
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show authentication dialog for unauthenticated users
  if (!user) {
    console.log('🚫 Showing authentication required screen');
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Authentication Required
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
              You need to be logged in to register for hackathons
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Please sign in to your account or create a new one to join this hackathon and start building amazing projects!
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleLoginRedirect}
                sx={{ px: 4, py: 1.5 }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleSignUpRedirect}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Account
              </Button>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="text"
                onClick={() => navigate('/hackathons')}
              >
                ← Back to Hackathons
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
            <CelebrationIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
              Registration Successful! 🎉
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Welcome to the hackathon, {user?.username || user?.email}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your team "<strong>{teamName}</strong>" has been created successfully.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              What would you like to do next?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/hackathons/${hackathonId}/submit-project`)}
                sx={{ 
                  px: 3, 
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                  }
                }}
              >
                Submit Project Now
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/hackathons/${hackathonId}`)}
              >
                View Hackathon Details
              </Button>
              <Button 
                variant="text" 
                onClick={() => navigate('/hackathons')}
              >
                Browse All Hackathons
              </Button>
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
              <Typography variant="body2" color="info.main">
                💡 <strong>Next Step:</strong> Submit your project to participate in the hackathon evaluation!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  console.log('✅ Showing registration form for authenticated user:', user?.email);
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Join Hackathon
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          Welcome back, {user?.username || user?.email}! Register your team and start building amazing projects!
        </Typography>
        <Divider sx={{ maxWidth: 200, mx: 'auto' }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <GroupIcon sx={{ mr: 2, color: 'primary.main', fontSize: 30 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Create Your Team
            </Typography>
          </Box>

          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            You'll be automatically registered as a participant in this hackathon. 
            Choose a creative name for your team to get started!
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              required
              fullWidth
              label="Team Name"
              value={teamName}
              onChange={handleTeamNameChange}
              error={!!teamNameError}
              helperText={teamNameError || "This will be your team's identity throughout the hackathon"}
              placeholder="Enter a creative team name..."
              sx={{ mb: 4 }}
              disabled={loading}
              autoFocus
            />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !teamName.trim()}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                  },
                  '&:disabled': {
                    background: 'grey.300',
                    transform: 'none',
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Registering...
                  </>
                ) : (
                  'Join Hackathon & Create Team'
                )}
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              📋 What happens next?
            </Typography>
            <Typography variant="body2" color="textSecondary" component="div">
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>You'll be registered as a participant in this hackathon</li>
                <li>Your team will be created with you as the team leader</li>
                <li>You can invite team members later from the team dashboard</li>
                <li>You can update project details when submitting your work</li>
              </Box>
            </Typography>
          </Box>

          {/* Alternative Option */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Already have teammates? Want to join an existing team?
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/hackathons/${hackathonId}/browse-teams`)}
              sx={{ px: 4 }}
            >
              Browse Existing Teams
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HackathonRegistrationPage; 