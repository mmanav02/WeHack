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

interface UserHackathon {
  id: number;
  name: string;
  role: string;
  status: string;
  joinedAt?: string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [userHackathons, setUserHackathons] = useState<UserHackathon[]>([]);
  const [error, setError] = useState('');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<UserHackathon | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Mock data for demonstration - in real app, this would come from an API
  useEffect(() => {
    // This would be replaced with actual API call to get user's hackathons
    const mockUserHackathons: UserHackathon[] = [
      {
        id: 1,
        name: "AI Innovation Challenge",
        role: "PARTICIPANT",
        status: "ACTIVE",
        joinedAt: "2024-01-15"
      },
      {
        id: 2,
        name: "Web3 Hackathon",
        role: "JUDGE",
        status: "PENDING",
        joinedAt: "2024-01-20"
      }
    ];
    setUserHackathons(mockUserHackathons);
  }, []);

  const handleLeaveHackathon = async () => {
    if (!selectedHackathon || !user) return;

    try {
      setLeaving(true);
      await hackathonRegistrationAPI.leaveHackathon({
        userId: user.id,
        hackathonId: selectedHackathon.id
      });

      // Remove from local state
      setUserHackathons(prev => prev.filter(h => h.id !== selectedHackathon.id));
      setShowLeaveDialog(false);
      setSelectedHackathon(null);
    } catch (err: any) {
      console.error('Failed to leave hackathon:', err);
      setError('Failed to leave hackathon. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  const handleLeaveClick = (hackathon: UserHackathon) => {
    setSelectedHackathon(hackathon);
    setShowLeaveDialog(true);
  };

  const handleCloseDialog = () => {
    setShowLeaveDialog(false);
    setSelectedHackathon(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PARTICIPANT':
        return 'primary';
      case 'JUDGE':
        return 'secondary';
      case 'ORGANIZER':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'default';
      default:
        return 'info';
    }
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {hackathon.name}
                      </Typography>
                      <Chip 
                        label={hackathon.role} 
                        size="small" 
                        color={getRoleColor(hackathon.role)}
                        variant="outlined"
                      />
                      <Chip 
                        label={hackathon.status} 
                        size="small" 
                        color={getStatusColor(hackathon.status)}
                      />
                    </Box>
                  }
                  secondary={
                    hackathon.joinedAt && (
                      <Typography variant="caption" color="textSecondary">
                        Joined: {new Date(hackathon.joinedAt).toLocaleDateString()}
                      </Typography>
                    )
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<LeaveIcon />}
                    onClick={() => handleLeaveClick(hackathon)}
                    disabled={loading}
                  >
                    Leave
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Leave Confirmation Dialog */}
        <Dialog 
          open={showLeaveDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Confirm Leave Hackathon
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to leave <strong>{selectedHackathon?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This action cannot be undone. You will lose access to:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Team memberships and project data</li>
              <li>Submission history</li>
              <li>Access to hackathon resources</li>
              {selectedHackathon?.role === 'JUDGE' && (
                <li>Judging assignments and scoring access</li>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleLeaveHackathon}
              color="error"
              variant="contained"
              disabled={leaving}
              startIcon={leaving ? <CircularProgress size={16} /> : <LeaveIcon />}
            >
              {leaving ? 'Leaving...' : 'Leave Hackathon'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserDashboard; 