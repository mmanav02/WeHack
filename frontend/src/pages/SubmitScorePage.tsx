import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Slider,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Gavel as JudgeIcon,
  Send as SendIcon,
  Lightbulb as InnovationIcon,
  TrendingUp as ImpactIcon,
  Engineering as ExecutionIcon
} from '@mui/icons-material';
import { judgeScoreAPI, submissionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Submission {
  id: number;
  title: string;
  description: string;
  teamName: string;
  // Add more fields as needed
}

const SubmitScorePage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Score states
  const [innovation, setInnovation] = useState<number>(5);
  const [impact, setImpact] = useState<number>(5);
  const [execution, setExecution] = useState<number>(5);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      // Backend doesn't have GET /submissions/{id} endpoint yet  
      // Using mock data for demonstration
      
      const mockSubmission: Submission = {
        id: parseInt(submissionId!),
        title: `Innovative Project ${submissionId}`,
        description: `A comprehensive solution that addresses real-world challenges through innovative technology implementation.`,
        teamName: `Team Beta ${submissionId}`
      };
      
      setSubmission(mockSubmission);
      
      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await submissionAPI.getById(parseInt(submissionId!));
      // setSubmission(response.data);
    } catch (err: any) {
      console.error('Failed to fetch submission:', err);
      setError('Failed to load submission details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit scores.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const scoreData = {
        submissionId: parseInt(submissionId!),
        judgeId: user.id,
        innovation: innovation,
        impact: impact,
        execution: execution
      };

      console.log('Submitting score data:', scoreData);
      
      await judgeScoreAPI.submitScore(scoreData);
      
      setSuccess(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/submissions');
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to submit score:', err);
      
      // Handle specific error cases
      if (err.response?.status === 500 && err.response?.data?.message?.includes('Submission not found')) {
        setError('This submission does not exist in the database. Please contact the administrator.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('You are not authorized to score this submission.');
      } else if (err.response?.status === 400) {
        setError('Invalid score data. Please check your inputs and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to submit score. Please try again.');
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

  const totalScore = innovation + impact + execution;
  const averageScore = (totalScore / 3).toFixed(1);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <JudgeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="textSecondary">
            You must be logged in as a judge to submit scores.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading submission...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <JudgeIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" color="success.main" gutterBottom>
            Score Submitted Successfully! 🎉
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Thank you for judging this submission.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your scores have been recorded and will contribute to the final evaluation.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Redirecting to submissions page in 2 seconds...
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/submissions')}
              sx={{ mr: 2 }}
            >
              View Submissions
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/hackathons')}
            >
              Back to Hackathons
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <JudgeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Submit Score
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Evaluate this hackathon submission
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Submission Details */}
      {submission && (
        <Card sx={{ mb: 3 }} elevation={2}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {submission.title}
            </Typography>
            {submission.teamName && (
              <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
                by {submission.teamName}
              </Typography>
            )}
            <Typography variant="body1">
              {submission.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Scoring Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Judge Evaluation
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Innovation Score */}
          <Card sx={{ mb: 3 }} elevation={1}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InnovationIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Innovation
                </Typography>
                <Chip 
                  label={innovation} 
                  color={getScoreColor(innovation)}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                How creative and original is this solution?
              </Typography>
              <Slider
                value={innovation}
                onChange={(_, value) => setInnovation(value as number)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                disabled={submitting}
              />
            </CardContent>
          </Card>

          {/* Impact Score */}
          <Card sx={{ mb: 3 }} elevation={1}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ImpactIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Impact
                </Typography>
                <Chip 
                  label={impact} 
                  color={getScoreColor(impact)}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                What potential does this solution have to solve real problems?
              </Typography>
              <Slider
                value={impact}
                onChange={(_, value) => setImpact(value as number)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                disabled={submitting}
              />
            </CardContent>
          </Card>

          {/* Execution Score */}
          <Card sx={{ mb: 3 }} elevation={1}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExecutionIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Execution
                </Typography>
                <Chip 
                  label={execution} 
                  color={getScoreColor(execution)}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                How well is this solution implemented and presented?
              </Typography>
              <Slider
                value={execution}
                onChange={(_, value) => setExecution(value as number)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                disabled={submitting}
              />
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Score Summary */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Total Score: {totalScore}/30
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
              Average: {averageScore}/10
            </Typography>
          </Box>

          {/* Submit Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                },
                '&:disabled': {
                  background: 'grey.300',
                  transform: 'none',
                }
              }}
            >
              {submitting ? 'Submitting Score...' : 'Submit Score'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Judging Guidelines */}
      <Card sx={{ mt: 3 }} elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Judging Guidelines
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li><strong>Innovation (1-10):</strong> Creativity, originality, and uniqueness of the solution</li>
              <li><strong>Impact (1-10):</strong> Potential to solve real problems and create value</li>
              <li><strong>Execution (1-10):</strong> Quality of implementation, presentation, and completeness</li>
            </Box>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubmitScorePage; 