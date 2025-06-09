import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import { 
  ExitToApp as LeaveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RoleFactory } from '../utils/RoleFactory';
import type { Role, ApprovalStatus } from '../utils/RoleFactory';

interface UserHackathon {
  id: number;
  name: string;
  role: string;
  status: string;
  joinedAt?: string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [userHackathons, setUserHackathons] = useState<UserHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserHackathons();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserHackathons = async () => {
    try {
      setLoading(true);
      // Note: This is a placeholder as we don't have a direct API for user's hackathons
      // In a real implementation, you'd call an API endpoint
      setUserHackathons([
        // Mock data for demonstration
        {
          id: 1,
          name: "AI Innovation Challenge",
          role: "PARTICIPANT",
          status: "APPROVED",
          joinedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Web3 Builders Hackathon",
          role: "JUDGE",
          status: "PENDING",
          joinedAt: new Date().toISOString()
        }
      ]);
    } catch (err: any) {
      console.error('Failed to fetch user hackathons:', err);
      setError('Failed to load your hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveHackathon = async (hackathonId: number) => {
    if (!user) return;

    try {
      setLeaving(true);
      await hackathonRegistrationAPI.leaveHackathon({ 
        userId: user.id, 
        hackathonId 
      });
      
      // Remove from local state
      setUserHackathons(prev => prev.filter(h => h.id !== hackathonId));
      setConfirmLeave(null);
      
    } catch (err: any) {
      console.error('Failed to leave hackathon:', err);
      setError('Failed to leave hackathon. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  // Factory pattern methods for consistent styling
  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    return RoleFactory.getRoleColor(role as Role);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    return RoleFactory.getStatusColor(status as ApprovalStatus);
  };

  if (!user) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Please log in to view your dashboard
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your hackathons...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Hackathons
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {userHackathons.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              You haven't joined any hackathons yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Browse available hackathons and start participating!
            </Typography>
          </Box>
        ) : (
          <List>
            {userHackathons.map((hackathon, index) => (
              <ListItem 
                key={hackathon.id}
                divider={index < userHackathons.length - 1}
                sx={{ px: 0 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {hackathon.name}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {/* Using Factory pattern for role colors */}
                      <Chip 
                        label={hackathon.role} 
                        size="small" 
                        color={getRoleColor(hackathon.role)}
                        variant="outlined"
                      />
                      
                      {/* Using Factory pattern for status colors */}
                      <Chip 
                        label={hackathon.status} 
                        size="small" 
                        color={getStatusColor(hackathon.status)}
                        variant={hackathon.status === 'PENDING' ? 'outlined' : 'filled'}
                      />
                      
                      {hackathon.joinedAt && (
                        <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center' }}>
                          Joined: {new Date(hackathon.joinedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<LeaveIcon />}
                    onClick={() => setConfirmLeave(hackathon.id)}
                    disabled={leaving}
                  >
                    Leave
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      {/* Leave Confirmation Dialog */}
      <Dialog
        open={confirmLeave !== null}
        onClose={() => setConfirmLeave(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirm Leave Hackathon
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this hackathon? This action cannot be undone and you'll lose:
          </Typography>
          <Box component="ul" sx={{ mt: 2, pl: 2 }}>
            <li>Your team membership (if any)</li>
            <li>All submitted projects</li>
            <li>Your participation history</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLeave(null)}>
            Cancel
          </Button>
          <Button 
            onClick={() => confirmLeave && handleLeaveHackathon(confirmLeave)}
            color="error" 
            variant="contained"
            disabled={leaving}
          >
            {leaving ? 'Leaving...' : 'Leave Hackathon'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default UserDashboard; 