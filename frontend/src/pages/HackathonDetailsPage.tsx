import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  Gavel as JudgeIcon,
  Assignment as SubmissionIcon,
  Settings as ManageIcon,
  Add as AddIcon,
  EmojiEvents as LeaderboardIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { hackathonAPI, hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Hackathon {
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
  organizerId?: number;
  participantsCount?: number;
  judgesCount?: number;
  submissionsCount?: number;
}

interface Participant {
  id: number;
  username: string;
  email: string;
  role: string;
  status?: string;
}

// Custom Stepper Connector for State Flow
const StateConnector = styled(StepConnector)(({ theme }) => ({
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.success.main,
  },
  '.MuiStepConnector-line': {
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// Utility function to safely display date
const formatDisplayDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date not set';
  
  // If it's already in DD-MM-YYYY format or contains "to" (date range), return as is
  if (/^\d{2}-\d{2}-\d{4}/.test(dateString) || dateString.includes(' to ')) {
    return dateString;
  }
  
  // Try to parse and format the date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format as DD-MM-YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return 'Date not available';
  }
};

const HackathonDetailsPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isApprovedJudge, setIsApprovedJudge] = useState(false);

  // State flow steps
  const steps = ['Draft', 'Published', 'Judging', 'Completed'];
  const stepIcons = [
    <EventIcon />,
    <PublishIcon />,
    <JudgeIcon />,
    <CompleteIcon />
  ];

  useEffect(() => {
    if (hackathonId) {
      fetchHackathon();
      fetchParticipants();
      checkJudgeStatus();
    }
  }, [hackathonId, user]);

  // Update participant count when participants list changes
  useEffect(() => {
    if (hackathon && hackathon.participantsCount !== participants.length) {
      setHackathon(prev => prev ? {
        ...prev,
        participantsCount: participants.length
      } : null);
    }
  }, [participants.length]);

  const fetchHackathon = async () => {
    try {
      setLoading(true);
      
      // Get hackathon info
      const hackathonsResponse = await hackathonAPI.getAll();
      const allHackathons = hackathonsResponse.data;
      const currentHackathon = allHackathons.find((h: any) => h.id === parseInt(hackathonId!));
      
      if (!currentHackathon) {
        setError('Hackathon not found');
        return;
      }
      
      // Fetch submissions count
      let submissionsCount = 0;
      try {
        const submissionsResponse = await fetch(`http://localhost:8080/submissions/hackathon/${hackathonId}`);
        if (submissionsResponse.ok) {
          const submissions = await submissionsResponse.json();
          submissionsCount = submissions.length || 0;
        }
      } catch (err) {
        console.log('No submissions found');
      }
      
      const hackathonData: Hackathon = {
        id: currentHackathon.id,
        title: currentHackathon.title,
        description: currentHackathon.description,
        date: currentHackathon.date,
        status: currentHackathon.status || 'Draft',
        organizerId: currentHackathon.organizerId,
        participantsCount: 0,
        judgesCount: 0,
        submissionsCount
      };
      
      setHackathon(hackathonData);
    } catch (err: any) {
      console.error('Failed to fetch hackathon:', err);
      setError('Failed to load hackathon details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      // Fetch actual participants from backend
      const participantsResponse = await hackathonRegistrationAPI.getParticipants(parseInt(hackathonId!));
      const participantRoles = participantsResponse.data || [];
      
      // Transform participant roles to participant format
      const realParticipants: Participant[] = participantRoles.map((role: any) => ({
        id: role.user?.id || role.userId,
        username: role.user?.username || `User ${role.userId}`,
        email: role.user?.email || `user${role.userId}@example.com`,
        role: 'PARTICIPANT',
        status: role.status // Should be APPROVED for participants
      }));
      
      // Only set participants, no judge requests
      setParticipants(realParticipants);
      
      console.log(`✅ Found ${realParticipants.length} participants`);
      
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      // Fallback to empty list
      setParticipants([]);
    }
  };

  const checkJudgeStatus = async () => {
    try {
      if (!user) {
        setIsApprovedJudge(false);
        return;
      }
      
      // Get judge requests for this hackathon
      const judgeRequestsResponse = await hackathonRegistrationAPI.getPendingJudgeRequests(parseInt(hackathonId!));
      const judgeRequests = judgeRequestsResponse.data || [];
      
      // Check if current user is an approved judge
      const userJudgeRequest = judgeRequests.find((request: any) => 
        (request.user?.id === user.id || request.userId === user.id) && 
        request.status === 'APPROVED'
      );
      
      setIsApprovedJudge(!!userJudgeRequest);
      console.log(`🔍 Judge status check: ${!!userJudgeRequest ? 'APPROVED' : 'NOT APPROVED'} for user ${user.email}`);
      
    } catch (err) {
      console.error('Failed to check judge status:', err);
      setIsApprovedJudge(false);
    }
  };

  const getActiveStep = (status: string) => {
    switch (status) {
      case 'Draft': return 0;
      case 'Published': return 1;
      case 'Judging': return 2;
      case 'Completed': return 3;
      default: return 0;
    }
  };

  const isStepCompleted = (stepIndex: number, currentStatus: string) => {
    const currentStep = getActiveStep(currentStatus);
    return stepIndex < currentStep || (stepIndex === currentStep && currentStatus === 'Completed');
  };

  const isOrganizer = () => {
    return user && hackathon && hackathon.organizerId && user.id === hackathon.organizerId;
  };

  const handleStateTransition = async (targetState: string) => {
    if (!hackathon) return;
    
    try {
      setTransitioning(true);
      setError('');
      setSuccessMessage('');
      
      let actionMessage = '';
      switch (targetState) {
        case 'Published':
          await hackathonAPI.publish(hackathon.id);
          actionMessage = '🎉 Hackathon published successfully! It\'s now visible to all participants.';
          break;
        case 'Judging':
          await hackathonAPI.startJudging(hackathon.id);
          actionMessage = '⚖️ Judging phase started! Approved judges can now evaluate submissions.';
          break;
        case 'Completed':
          await hackathonAPI.complete(hackathon.id);
          actionMessage = '🏆 Hackathon completed successfully! Results are now final.';
          break;
      }
      
      // Immediately update local state for better UX
      setHackathon(prev => prev ? {
        ...prev,
        status: targetState
      } : null);
      
      // Show success message
      setSuccessMessage(actionMessage);
      
      // Refresh hackathon data from backend
      await fetchHackathon();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err: any) {
      console.error('Failed to transition state:', err);
      setError(`Failed to ${targetState.toLowerCase()} hackathon. ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setTransitioning(false);
    }
  };

  const handleJudgeRequest = () => {
    if (isOrganizer()) {
      navigate(`/hackathons/${hackathonId}/judge-management`);
    } else {
      navigate(`/hackathons/${hackathonId}/apply-judge`);
    }
  };

  const handleSubmit = () => {
    navigate(`/hackathons/${hackathonId}/register`);
  };

  const handleDeleteHackathon = async () => {
    if (!hackathon) return;
    
    try {
      setDeleting(true);
      await hackathonAPI.delete(hackathon.id);
      setDeleteDialogOpen(false);
      navigate('/hackathons', { 
        state: { message: `Hackathon "${hackathon.title}" deleted successfully!` }
      });
    } catch (err: any) {
      console.error('Failed to delete hackathon:', err);
      setError('Failed to delete hackathon. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading hackathon details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/hackathons')}>
          Back to Hackathons
        </Button>
      </Container>
    );
  }

  if (!hackathon) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="warning">
          Hackathon not found
        </Alert>
      </Container>
    );
  }

  // Access control: Draft hackathons only visible to organizers
  if (hackathon.status === 'Draft' && !isOrganizer()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This hackathon is still in draft mode and not yet published.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/hackathons')}>
          Back to Hackathons
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Left Side - Main Hackathon Info */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            {/* Success Message */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}
            
            {/* Title Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Title: {hackathon.title}
              </Typography>
              <Chip 
                label={hackathon.status} 
                color={hackathon.status === 'Published' ? 'success' : 
                       hackathon.status === 'Draft' ? 'warning' :
                       hackathon.status === 'Judging' ? 'info' : 'default'}
                size="small"
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Description Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description:
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {hackathon.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <EventIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Date: {formatDisplayDate(hackathon.date)}
              </Typography>
            </Box>

            {/* State-specific messaging */}
            <Box sx={{ mb: 3 }}>
              {hackathon.status === 'Draft' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  📝 <strong>Draft Mode:</strong> This hackathon is not yet visible to participants. Publish it when you're ready to open registration.
                </Alert>
              )}
              {hackathon.status === 'Published' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  🎉 <strong>Published:</strong> Your hackathon is live! Participants can now register and teams can submit their projects.
                </Alert>
              )}
              {hackathon.status === 'Judging' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  ⚖️ <strong>Judging Phase:</strong> Submission period has ended. Approved judges are now evaluating the projects.
                </Alert>
              )}
              {hackathon.status === 'Completed' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  🏆 <strong>Completed:</strong> Hackathon has ended. Check out the final leaderboard and winning submissions!
                </Alert>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* State Flow Visualization - D→P→J→C */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
            
              </Typography>
              <Stepper 
                activeStep={getActiveStep(hackathon.status)} 
                connector={<StateConnector />}
                sx={{ mt: 2 }}
              >
                {steps.map((label, index) => (
                  <Step key={label} completed={isStepCompleted(index, hackathon.status)}>
                    <StepLabel icon={stepIcons[index]}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Organizer Controls */}
            {isOrganizer() && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Organizer Controls:
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  {hackathon.status === 'Draft' && (
                    <Button
                      variant="contained"
                      startIcon={transitioning ? <CircularProgress size={16} /> : <PublishIcon />}
                      onClick={() => handleStateTransition('Published')}
                      disabled={transitioning}
                    >
                      {transitioning ? 'Publishing...' : 'Publish'}
                    </Button>
                  )}
                  {hackathon.status === 'Published' && (
                    <Button
                      variant="contained"
                      startIcon={transitioning ? <CircularProgress size={16} /> : <StartIcon />}
                      onClick={() => handleStateTransition('Judging')}
                      disabled={transitioning}
                    >
                      {transitioning ? 'Starting...' : 'Start Judging'}
                    </Button>
                  )}
                  {hackathon.status === 'Judging' && (
                    <Button
                      variant="contained"
                      startIcon={transitioning ? <CircularProgress size={16} /> : <CompleteIcon />}
                      onClick={() => handleStateTransition('Completed')}
                      disabled={transitioning}
                    >
                      {transitioning ? 'Completing...' : 'Complete'}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={transitioning}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Grid container spacing={2}>
                {/* Judge Request/Management Button */}
                {(hackathon.status === 'Published' || hackathon.status === 'Judging') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<JudgeIcon />}
                      onClick={handleJudgeRequest}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      {isOrganizer() ? 'Manage Judges' : 'Judge Req'}
                    </Button>
                  </Grid>
                )}
                
                {/* Team Management Button - Only for organizers */}
                {isOrganizer() && (hackathon.status === 'Published' || hackathon.status === 'Judging' || hackathon.status === 'Completed') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<TeamIcon />}
                      onClick={() => navigate(`/hackathons/${hackathonId}/team-management`)}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      Manage Teams
                    </Button>
                  </Grid>
                )}
                
                {/* Judge Submissions Button - Only for approved judges in Judging state */}
                {isApprovedJudge && hackathon.status === 'Judging' && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<JudgeIcon />}
                      onClick={() => navigate('/submissions')}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      Judge Submissions
                    </Button>
                  </Grid>
                )}
                
                {/* Registration & Project Submission - Only for non-organizers in Published state */}
                {!isOrganizer() && hackathon.status === 'Published' && (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={handleSubmit}
                        fullWidth
                        sx={{ height: 48 }}
                      >
                        Register Team
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<TeamIcon />}
                        onClick={() => navigate(`/hackathons/${hackathonId}/browse-teams`)}
                        fullWidth
                        sx={{ height: 48 }}
                      >
                        Browse Teams
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<SubmissionIcon />}
                        onClick={() => navigate(`/hackathons/${hackathonId}/submit-project`)}
                        fullWidth
                        sx={{ height: 48 }}
                      >
                        Submit Project
                      </Button>
                    </Grid>
                  </>
                )}
                
                {/* Leaderboard Button - Visible in Judging and Completed states */}
                {(hackathon.status === 'Judging' || hackathon.status === 'Completed') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      startIcon={<LeaderboardIcon />}
                      onClick={() => navigate(`/hackathons/${hackathonId}/leaderboard`)}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      View Leaderboard
                    </Button>
                  </Grid>
                )}

                {/* Draft state - Only show to organizers */}
                {hackathon.status === 'Draft' && isOrganizer() && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      🔒 Publish your hackathon to make it visible to participants
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side - Participants & Stats */}
        <Grid item xs={12} md={4}>
          {/* Statistics */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography>Participants: {hackathon.participantsCount || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SubmissionIcon color="success" />
                <Typography>Submissions: {hackathon.submissionsCount || 0}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* List of Participants */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              List of Participants
            </Typography>
            
            {/* State-specific context */}
            {hackathon.status === 'Draft' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Participants will appear here after you publish the hackathon
              </Alert>
            )}
            {hackathon.status === 'Published' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration is open! Participants can now join
              </Alert>
            )}
            {hackathon.status === 'Judging' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Hackathon is in judging phase
              </Alert>
            )}
            {hackathon.status === 'Completed' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Final participant list is now available
              </Alert>
            )}
            
            <List dense>
              {participants.length > 0 ? (
                participants.map((participant) => (
                  <ListItem key={participant.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={participant.username}
                      secondary={participant.email}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No participants yet
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Hackathon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{hackathon.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteHackathon} 
            color="error" 
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HackathonDetailsPage; 