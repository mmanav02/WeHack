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
  TextField,
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
import { hackathonRegistrationAPI, authAPI } from '../services/api';
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
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

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

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) {
      return;
    }

    try {
      setAddingMember(true);
      setError('');
      
      console.log('Looking up user by email:', newMemberEmail);
      
      // Step 1: Find user by email
      const userResponse = await authAPI.findUserByEmail(newMemberEmail.trim());
      
      if (!userResponse.data) {
        setError('User not found with that email address. Please check the email and try again.');
        return;
      }
      
      const foundUser = userResponse.data;
      console.log('Found user:', foundUser);
      
      // Step 2: Add user to team
      console.log('Adding user', foundUser.id, 'to team:', selectedTeam.id);
      await hackathonRegistrationAPI.addTeamMember(selectedTeam.id, foundUser.id);
      
      console.log('✅ Successfully added member to team');
      
      // Step 3: Clear form and refresh teams
      setNewMemberEmail('');
      setShowAddMemberDialog(false);
      
      // Show success message
      setSuccess(`✅ Successfully added ${foundUser.username || foundUser.email} to ${selectedTeam.name}!`);
      
      // Refresh teams to show updated member list
      await fetchTeams();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err: any) {
      console.error('Failed to add team member:', err);
      if (err.response?.status === 404) {
        setError('User not found with that email address. Please check the email and try again.');
      } else {
        setError('Failed to add team member. The user may already be in a team or an error occurred.');
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleOpenAddMember = (team: Team) => {
    setSelectedTeam(team);
    setShowAddMemberDialog(true);
  };

  const handleCloseAddMember = () => {
    setShowAddMemberDialog(false);
    setSelectedTeam(null);
    setNewMemberEmail('');
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
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {teams.length}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Total Teams
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Total Participants
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {Math.round(teams.reduce((acc, team) => acc + (team.members?.length || 0), 0) / teams.length || 0)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Avg Team Size
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
                    <Tooltip title="Add Team Member">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenAddMember(team)}
                        sx={{ color: 'primary.main' }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
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

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onClose={handleCloseAddMember} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Team Member
          {selectedTeam && (
            <Typography variant="body2" color="textSecondary">
              Adding to: {selectedTeam.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Member Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Enter the email of the user to add"
            sx={{ mt: 2 }}
            error={!!error && error.includes('email')}
            helperText={error && error.includes('email') ? error : ''}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            💡 <strong>How it works:</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div" sx={{ mt: 1 }}>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Enter the email of a registered user</li>
              <li>They will be added to the team immediately</li>
              <li>The user must have an account on the platform</li>
              <li>Users can only be in one team per hackathon</li>
            </Box>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddMember}>Cancel</Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained"
            disabled={!newMemberEmail.trim() || addingMember}
          >
            {addingMember ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Adding...
              </>
            ) : (
              'Add Member'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamManagementPage; 