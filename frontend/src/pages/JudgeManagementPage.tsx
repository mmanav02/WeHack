import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { 
  Gavel as JudgeIcon, 
  Person as PersonIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon 
} from '@mui/icons-material';
import { hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface JudgeRequest {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  hackathon: {
    id: number;
    name: string;
  };
  role: string;
  status: string;
  createdAt?: string;
}

const JudgeManagementPage = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [judgeRequests, setJudgeRequests] = useState<JudgeRequest[]>([]);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [approvedJudge, setApprovedJudge] = useState<JudgeRequest | null>(null);

  useEffect(() => {
    if (hackathonId) {
      fetchJudgeRequests();
    }
  }, [hackathonId]);

  const fetchJudgeRequests = async () => {
    try {
      setLoading(true);
      const response = await hackathonRegistrationAPI.getPendingJudgeRequests(parseInt(hackathonId!));
      const requests = response.data;
      
      // Check if there's already an approved judge
      const approved = requests.find((req: JudgeRequest) => req.status === 'APPROVED');
      setApprovedJudge(approved || null);
      
      // Filter to show only pending requests if no judge is approved yet
      // or show all requests for reference
      setJudgeRequests(requests);
    } catch (err: any) {
      console.error('Failed to fetch judge requests:', err);
      setError('Failed to load judge requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingId(userId);
      setError('');
      setSuccessMessage('');
      
      const selectedRequest = judgeRequests.find(req => req.user.id === userId);
      
      await hackathonRegistrationAPI.updateJudgeStatus({
        hackathonId: parseInt(hackathonId!),
        userId: userId,
        status: status
      });
      
      // Show success message based on action
      if (status === 'APPROVED') {
        setSuccessMessage(`✅ ${selectedRequest?.user.username || 'Judge'} has been approved as a judge! They can now evaluate submissions when judging phase begins.`);
        setApprovedJudge(selectedRequest || null);
      } else {
        setSuccessMessage(`❌ ${selectedRequest?.user.username || 'Judge'} request has been rejected.`);
      }
      
      // Refresh the list
      await fetchJudgeRequests();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err: any) {
      console.error('Failed to update judge status:', err);
      setError(`Failed to ${status.toLowerCase()} judge request. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading judge requests...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <JudgeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Judge Management
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Review and approve judge applications for this hackathon
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Approved Judge Section */}
      {approvedJudge && (
        <Card elevation={2} sx={{ mb: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ApproveIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                Selected Judge
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <JudgeIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {approvedJudge.user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {approvedJudge.user.email}
                </Typography>
                <Chip label="APPROVED" color="success" size="small" sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              This judge will be able to evaluate submissions once the judging phase begins.
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {approvedJudge ? 'Other Requests' : 'Pending Judge Requests'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {approvedJudge 
                ? `${judgeRequests.filter(req => req.status !== 'APPROVED').length} other request(s) - judge already selected`
                : `${judgeRequests.filter(req => req.status === 'PENDING').length} request(s) pending approval`
              }
            </Typography>
          </Box>

          {judgeRequests.filter(req => req.status !== 'APPROVED').length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                {approvedJudge ? 'No other requests' : 'No pending judge requests'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {approvedJudge 
                  ? 'All other judge applications have been processed.'
                  : 'All judge applications have been processed.'
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ pt: 0 }}>
              {judgeRequests
                .filter(req => req.status !== 'APPROVED')
                .map((request, index) => (
                  <div key={request.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {request.user.username || 'Anonymous'}
                            </Typography>
                            <Chip 
                              label={request.role} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={request.status} 
                              size="small" 
                              color={
                                request.status === 'APPROVED' ? 'success' :
                                request.status === 'REJECTED' ? 'error' : 'warning'
                              }
                              variant={request.status === 'PENDING' ? 'outlined' : 'filled'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="textSecondary">
                              {request.user.email}
                            </Typography>
                            {request.createdAt && (
                              <Typography variant="caption" color="textSecondary">
                                Applied: {new Date(request.createdAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {request.status === 'PENDING' ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleStatusUpdate(request.user.id, 'APPROVED')}
                              disabled={processingId === request.user.id || !!approvedJudge}
                              sx={{ minWidth: 100 }}
                            >
                              {processingId === request.user.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                approvedJudge ? 'Judge Selected' : 'Approve'
                              )}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<RejectIcon />}
                              onClick={() => handleStatusUpdate(request.user.id, 'REJECTED')}
                              disabled={processingId === request.user.id}
                              sx={{ minWidth: 100 }}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : (
                          <Chip 
                            label={`${request.status}`} 
                            color={request.status === 'APPROVED' ? 'success' : 'error'}
                            variant="filled"
                          />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < judgeRequests.length - 1 && <Divider />}
                  </div>
                ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card sx={{ mt: 3 }} elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            ℹ️ Judge Selection Guidelines
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Review each judge application carefully</li>
              <li>
                <strong>Once you approve a judge, they will be able to evaluate submissions during the judging phase</strong>
              </li>
              <li>Approved judges will receive email notification and scoring access</li>
              <li>Rejected applications will be notified via email</li>
              <li>You can change judge decisions if needed before the judging phase begins</li>
              {approvedJudge && (
                <li style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  ✅ Judge selected! They can now score submissions when judging begins.
                </li>
              )}
            </Box>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JudgeManagementPage; 