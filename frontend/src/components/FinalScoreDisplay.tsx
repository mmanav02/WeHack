import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { judgeScoreAPI } from '../services/api';

interface FinalScoreDisplayProps {
  submissionId: number;
}

const FinalScoreDisplay: React.FC<FinalScoreDisplayProps> = ({ submissionId }) => {
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFinalScore();
  }, [submissionId]);

  const fetchFinalScore = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const response = await judgeScoreAPI.getFinalScore(submissionId);
      setFinalScore(response.data);
    } catch (err: any) {
      console.error('Failed to fetch final score:', err);
      
      // Handle specific error cases
      if (err.response?.status === 500 && err.response?.data?.message?.includes('Submission not found')) {
        setError('This submission does not exist in the database yet.');
      } else if (err.response?.status === 404) {
        setError('No scores available for this submission.');
      } else {
        setError('Failed to load final score.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Outstanding';
    if (score >= 8) return 'Excellent';
    if (score >= 7) return 'Very Good';
    if (score >= 6) return 'Good';
    if (score >= 5) return 'Average';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={30} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Loading final score...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (finalScore === null) {
    return (
      <Card elevation={2}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" color="textSecondary">
            No scores available yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrophyIcon sx={{ mr: 2, color: 'primary.main', fontSize: 30 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Final Score
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {finalScore.toFixed(1)}
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            out of 10
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={getScoreLabel(finalScore)}
              color={getScoreColor(finalScore)}
              variant="filled"
              icon={<StarIcon />}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinalScoreDisplay; 