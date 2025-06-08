import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  Groups as TeamsIcon, 
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
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
  updatedAt?: string;
}

interface TeamMember {
  id: number;
  username: string;
  email: string;
  role?: string;
}

const TeamManagementPage = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);

  useEffect(() => {
    if (hackathonId) {
      fetchTeams();
    }
  }, [hackathonId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍 Fetching teams for hackathon ${hackathonId}`);
      const response = await hackathonRegistrationAPI.listTeams(parseInt(hackathonId!));
      const teamsData = response.data || [];
      
      console.log(`✅ Found ${teamsData.length} teams:`, teamsData);
      setTeams(teamsData);
      
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams. Please try again.');
      setTeams([]); // Fallback to empty list
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam || !user) {
      return;
    }

    try {
      setJoiningTeam(true);
      setError('');
      
      console.log('Adding current user', user.id, 'to team:', selectedTeam.id);
      await hackathonRegistrationAPI.addTeamMember(selectedTeam.id, user.id);
      
      console.log('✅ Successfully joined team');
      
      // Close dialog
      setShowJoinTeamDialog(false);
      
      // Show success message
      setSuccess(`✅ Successfully joined ${selectedTeam.name}!`);
      
      // Refresh teams to show updated member list
      await fetchTeams();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err: any) {
      console.error('Failed to join team:', err);
      setError('Failed to join team. You may already be in a team or an error occurred.');
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleOpenJoinTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowJoinTeamDialog(true);
  };

  const handleCloseJoinTeam = () => {
    setShowJoinTeamDialog(false);
    setSelectedTeam(null);
  };

  const isUserInTeam = (team: Team) => {
    return team.members?.some(member => member.id === user?.id) || false;
  };

  const isUserInAnyTeam = () => {
    return teams.some(team => isUserInTeam(team));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading teams...
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
          Team Management
        </Typography>
        <Typography variant="h6" color="textSecondary">
          View and manage all teams participating in this hackathon
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

      {/* Teams Overview */}
      <Card sx={{ mb: 3 }} elevation={2}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Teams Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {teams.length}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Total Teams
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Total Participants
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Teams List */}
      {teams.length === 0 ? (
        <Card elevation={2}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No teams registered yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Teams will appear here once participants start registering.
            </Typography>
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
                    {user && !isUserInAnyTeam() && (
                      <Tooltip title="Join Team">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenJoinTeam(team)}
                          sx={{ color: 'primary.main' }}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {user && isUserInTeam(team) && (
                      <Chip label="Your Team" size="small" color="success" />
                    )}
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
                    Team Members:
                  </Typography>
                  <List dense sx={{ pt: 0 }}>
                    {(team.members || []).map((member) => (
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
                              {member.id === user?.id && ' (You)'}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="textSecondary">
                              {member.email}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
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
      <Dialog open={showJoinTeamDialog} onClose={handleCloseJoinTeam} maxWidth="sm" fullWidth>
        <DialogTitle>
          Join Team
          {selectedTeam && (
            <Typography variant="body2" color="textSecondary">
              Join: {selectedTeam.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to join "{selectedTeam?.name}"?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            💡 <strong>Note:</strong> You can only be in one team per hackathon.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinTeam}>Cancel</Button>
          <Button 
            onClick={handleJoinTeam} 
            variant="contained"
            disabled={joiningTeam}
          >
            {joiningTeam ? (
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

export default TeamManagementPage; 