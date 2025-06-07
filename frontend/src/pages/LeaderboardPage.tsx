import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { hackathonAPI } from '../services/api';

interface Submission {
  id: number;
  title: string;
  description: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  team?: {
    id: number;
    name: string;
  };
  hackathon: {
    id: number;
    title: string;
  };
  submitTime: string;
}

interface Hackathon {
  id: number;
  title: string;
  status: string;
}

const LeaderboardPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hackathonId) {
      fetchHackathonData();
      fetchLeaderboard();
    }
  }, [hackathonId]);

  const fetchHackathonData = async () => {
    try {
      const response = await hackathonAPI.getAll();
      const hackathons = response.data;
      const currentHackathon = hackathons.find((h: any) => h.id === parseInt(hackathonId!));
      
      if (currentHackathon) {
        setHackathon({
          id: currentHackathon.id,
          title: currentHackathon.title,
          status: currentHackathon.status
        });
      }
    } catch (err) {
      console.error('Failed to fetch hackathon data:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await hackathonAPI.getLeaderboard(parseInt(hackathonId!));
      setSubmissions(response.data || []);
      console.log('📊 Leaderboard data:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      if (err.response?.status === 404) {
        setError('Hackathon not found.');
      } else {
        setError('Failed to load leaderboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#E0E0E0'; // Gray
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon sx={{ color: getRankColor(rank), fontSize: 40 }} />;
    }
    return (
      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
        {rank}
      </Avatar>
    );
  };

  const formatSubmissionTime = (submitTime: string) => {
    return new Date(submitTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading leaderboard...
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
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/hackathons/${hackathonId}`)}
        >
          Back to Hackathon
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TrophyIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🏆 Leaderboard
        </Typography>
        {hackathon && (
          <Typography variant="h5" color="textSecondary" gutterBottom>
            {hackathon.title}
          </Typography>
        )}
        {hackathon && (
          <Chip 
            label={hackathon.status}
            color={hackathon.status === 'Completed' ? 'success' : 'info'}
            sx={{ mb: 3 }}
          />
        )}
      </Box>

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/hackathons/${hackathonId}`)}
        >
          Back to Hackathon Details
        </Button>
      </Box>

      {/* Leaderboard Content */}
      {submissions.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Submissions Yet
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {hackathon?.status === 'Draft' || hackathon?.status === 'Published' 
              ? 'The leaderboard will be available once judging begins.'
              : 'No submissions have been made for this hackathon yet.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {submissions.map((submission, index) => {
            const rank = index + 1;
            return (
              <Grid item xs={12} key={submission.id}>
                <Card 
                  elevation={rank <= 3 ? 6 : 2}
                  sx={{ 
                    position: 'relative',
                    border: rank <= 3 ? `3px solid ${getRankColor(rank)}` : 'none',
                    '&:hover': { elevation: 4 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {/* Rank */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                        {getRankIcon(rank)}
                        <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                          #{rank}
                        </Typography>
                      </Box>

                      <Divider orientation="vertical" flexItem />

                      {/* Submission Details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {submission.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {submission.user.username} ({submission.user.email})
                          </Typography>
                          {submission.team && (
                            <>
                              <Chip 
                                label={submission.team.name}
                                size="small"
                                variant="outlined"
                              />
                            </>
                          )}
                        </Box>

                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Submitted: {formatSubmissionTime(submission.submitTime)}
                        </Typography>

                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {submission.description || 'No description provided.'}
                        </Typography>
                      </Box>

                      {/* Action Button */}
                      <Box sx={{ minWidth: 120 }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/submissions/${submission.id}`)}
                          size="small"
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Footer Info */}
      {submissions.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            {hackathon?.status === 'Judging' && ' • Rankings updated in real-time'}
            {hackathon?.status === 'Completed' && ' • Final Results'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default LeaderboardPage; 