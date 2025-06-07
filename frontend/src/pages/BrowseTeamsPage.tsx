import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  Groups as TeamsIcon, 
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Team {
  id: number;
  name: string;
  hackathonId: number;
  members: TeamMember[];
  createdAt?: string;
}

interface TeamMember {
  id: number;
  username: string;
  email: string;
  role?: string;
}

const BrowseTeamsPage = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (hackathonId) {
      fetchAvailableTeams();
    }
  }, [hackathonId]);

  const fetchAvailableTeams = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍 Fetching available teams for hackathon ${hackathonId}`);
      const response = await hackathonRegistrationAPI.getAvailableTeams(parseInt(hackathonId!));
      const teamsData = response.data || [];
      
      // Filter out teams that the current user is already a member of
      const availableTeams = teamsData.filter((team: Team) => 
        !team.members?.some(member => member.id === user?.id)
      );
      
      console.log(`✅ Found ${availableTeams.length} available teams:`, availableTeams);
      setTeams(availableTeams);
      
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams. Please try again.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam || !user) {
      return;
    }

    try {
      setJoining(true);
      setError('');
      
      console.log('Requesting to join team:', selectedTeam.id, 'as user:', user.id);
      
      await hackathonRegistrationAPI.requestToJoinTeam(selectedTeam.id, user.id);
      
      setSuccess(`Successfully joined team "${selectedTeam.name}"!`);
      setShowJoinDialog(false);
      setSelectedTeam(null);
      
      // Refresh teams to remove the joined team from available list
      await fetchAvailableTeams();
      
      // Redirect to hackathon details after 3 seconds
      setTimeout(() => {
        navigate(`/hackathons/${hackathonId}`);
      }, 3000);
      
    } catch (err: any) {
      console.error('Failed to join team:', err);
      setError('Failed to join team. You may already be in a team or the team may be full.');
    } finally {
      setJoining(false);
    }
  };

  const handleOpenJoinDialog = (team: Team) => {
    setSelectedTeam(team);
    setShowJoinDialog(true);
  };

  const handleCloseJoinDialog = () => {
    setShowJoinDialog(false);
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading available teams...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TeamsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Browse Teams
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Find a team to join for this hackathon
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <Card elevation={2}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No teams available to join
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              All teams may be full, or you may already be in a team.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate(`/hackathons/${hackathonId}/register`)}
            >
              Create Your Own Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid item xs={12} md={6} lg={4} key={team.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {team.name}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleOpenJoinDialog(team)}
                    >
                      Join
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={`${team.members?.length || 0} member${(team.members?.length || 0) !== 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Current Members:
                  </Typography>
                  <List dense sx={{ pt: 0 }}>
                    {team.members?.slice(0, 3).map((member) => (
                      <ListItem key={member.id} sx={{ px: 0, py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {member.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {member.username}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {(team.members?.length || 0) > 3 && (
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        +{(team.members?.length || 0) - 3} more members
                      </Typography>
                    )}
                  </List>
                </CardContent>
                
                {team.createdAt && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Typography variant="caption" color="textSecondary">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Team Dialog */}
      <Dialog open={showJoinDialog} onClose={handleCloseJoinDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Join Team
          {selectedTeam && (
            <Typography variant="body2" color="textSecondary">
              Request to join: {selectedTeam.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to join "{selectedTeam.name}"?
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Current team has {selectedTeam.members?.length || 0} member{(selectedTeam.members?.length || 0) !== 1 ? 's' : ''}.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Note: You can only be part of one team per hackathon.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinDialog}>Cancel</Button>
          <Button 
            onClick={handleJoinTeam} 
            variant="contained"
            disabled={joining}
          >
            {joining ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Joining...
              </>
            ) : (
              'Join Team'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowseTeamsPage; 