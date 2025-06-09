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
import { hackathonRegistrationAPI, hackathonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RoleFactory, Role } from '../utils/RoleFactory';
import type { User, Hackathon, HackathonRole } from '../utils/RoleFactory';

const ApplyAsJudgePage = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [judgeRole, setJudgeRole] = useState<HackathonRole | null>(null);

  useEffect(() => {
    if (hackathonId) {
      fetchHackathonDetails();
    }
  }, [hackathonId]);

  useEffect(() => {
    // Create judge role request when both user and hackathon data are available
    if (user && hackathon && !judgeRole) {
      createJudgeRoleRequest();
    }
  }, [user, hackathon, judgeRole]);

  const fetchHackathonDetails = async () => {
    try {
      const response = await hackathonAPI.getAll();
      const hackathonData = response.data.find((h: any) => h.id === parseInt(hackathonId!));
      
      if (hackathonData) {
        const hackathonInfo: Hackathon = {
          id: hackathonData.id,
          title: hackathonData.title,
          status: hackathonData.status
        };
        setHackathon(hackathonInfo);
      }
    } catch (err) {
      console.error('Failed to fetch hackathon details:', err);
    }
  };

  const createJudgeRoleRequest = () => {
    if (!user || !hackathon) return;

    try {
      // Use RoleFactory to create role request with validation
      const userInfo: User = {
        id: user.id,
        username: user.username || user.email,
        email: user.email
      };

      const roleRequest = RoleFactory.createJudgeRequest(userInfo, hackathon);
      setJudgeRole(roleRequest);

      // Validate the role request
      const validation = RoleFactory.validateRoleRequest({
        user: userInfo,
        hackathon,
        role: Role.JUDGE
      });

      if (!validation.isValid) {
        setError(`Cannot apply as judge: ${validation.errors.join(', ')}`);
        return;
      }

      // If validation passes, automatically submit the request
      handleApplyAsJudge(roleRequest);
      
    } catch (err: any) {
      console.error('Role creation failed:', err);
      setError('Failed to create judge role request');
    }
  };

  const handleApplyAsJudge = async (roleRequest: HackathonRole) => {
    if (!user || !hackathonId) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Submit the role request to backend
      await hackathonRegistrationAPI.joinHackathon({
        userId: user.id,
        hackathonId: parseInt(hackathonId),
        role: 'JUDGE'
      });

      setSuccess(true);
      
      console.log('✅ Judge role request submitted:', {
        role: roleRequest.role,
        status: roleRequest.status,
        requiresReview: roleRequest.metadata?.requiresReview,
        autoApproved: roleRequest.metadata?.autoApproved
      });
      
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
        <Alert severity="warning">
          You must be logged in to apply as a judge.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Submitting Judge Application...
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Processing your request using RoleFactory validation
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (success && judgeRole) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
              Judge Application Submitted! 🎉
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your application for "{hackathon?.title}" has been submitted!
            </Typography>
            
            {/* Factory pattern metadata display */}
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity={judgeRole.metadata?.requiresReview ? "info" : "success"} 
                sx={{ mb: 2 }}
              >
                <Typography variant="body1">
                  <strong>Status:</strong> {judgeRole.status}
                </Typography>
                <Typography variant="body2">
                  {judgeRole.metadata?.requiresReview 
                    ? "Your application is pending review by the hackathon organizer"
                    : "Your application has been automatically approved"
                  }
                </Typography>
              </Alert>
              
              <Typography variant="body2" color="textSecondary">
                Role: {judgeRole.role} | Created: {judgeRole.createdAt.toLocaleString()}
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {judgeRole.metadata?.requiresReview 
                ? "You will be notified once the organizer reviews your application."
                : "You can now participate in judging when the judging phase begins."
              }
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Redirecting to hackathon details in 3 seconds...
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/hackathons/${hackathonId}`)}
              >
                Back to Hackathon
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
            </Box>
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
            <JudgeIcon sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
            <Typography variant="h5" color="error.main" gutterBottom>
              Application Failed
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            
            {judgeRole && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Role Request Details:
                </Typography>
                <Typography variant="body2">
                  Role: {judgeRole.role} | Status: {judgeRole.status}
                </Typography>
                <Typography variant="body2">
                  Can Edit: {judgeRole.metadata?.canEdit ? 'Yes' : 'No'}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => window.location.reload()}
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

  // Loading initial state
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <JudgeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Preparing Judge Application...
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Validating application using RoleFactory
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ApplyAsJudgePage; 