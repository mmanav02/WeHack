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
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  Description as SubmissionIcon,
  Group as TeamIcon,
  Code as CodeIcon,
  Gavel as JudgeIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { submissionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FinalScoreDisplay from '../components/FinalScoreDisplay';

interface Submission {
  id: number;
  title: string;
  description: string;
  teamName?: string;
  projectUrl?: string;
  repoUrl?: string;
  technology?: string[];
  submittedAt?: string;
  hackathonId?: number;
  hackathonName?: string;
  // Add more fields as needed
}

const SubmissionDetailsPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        title: `Sample Project ${submissionId}`,
        description: `This is a detailed description of submission ${submissionId}. This project demonstrates innovative use of technology to solve real-world problems. The team has implemented cutting-edge solutions with excellent execution and potential for significant impact.`,
        teamName: `Team Alpha ${submissionId}`,
        projectUrl: "https://example.com/demo",
        repoUrl: "https://github.com/example/project",
        technology: ["React", "Node.js", "MongoDB", "AI/ML"],
        submittedAt: new Date().toISOString(),
        hackathonId: 1,
        hackathonName: "Tech Innovation 2024"
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

  const handleJudgeSubmission = () => {
    navigate(`/submissions/${submissionId}/score`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading submission details...
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

  if (!submission) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Submission Not Found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            The submission you're looking for doesn't exist or has been removed.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/hackathons')}>
            Back to Hackathons
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SubmissionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {submission.title}
        </Typography>
        {submission.teamName && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
            <TeamIcon sx={{ color: 'text.secondary' }} />
            <Typography variant="h6" color="textSecondary">
              {submission.teamName}
            </Typography>
          </Box>
        )}
        {submission.hackathonName && (
          <Chip 
            label={submission.hackathonName}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Project Description */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Project Description
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {submission.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          {submission.technology && submission.technology.length > 0 && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CodeIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Technology Stack
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {submission.technology.map((tech, index) => (
                    <Chip 
                      key={index}
                      label={tech}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Project Links */}
          {(submission.projectUrl || submission.repoUrl) && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Project Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {submission.projectUrl && (
                    <Button
                      variant="outlined"
                      href={submission.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      🌐 Live Demo
                    </Button>
                  )}
                  {submission.repoUrl && (
                    <Button
                      variant="outlined"
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      📁 Source Code
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Judge Actions */}
          {user && (
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <JudgeIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Judge Actions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleJudgeSubmission}
                    startIcon={<JudgeIcon />}
                  >
                    Submit Score
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CommentIcon />}
                    disabled
                  >
                    Add Comments (Coming Soon)
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Final Score Display */}
          <Box sx={{ mb: 3 }}>
            <FinalScoreDisplay submissionId={parseInt(submissionId!)} />
          </Box>

          {/* Submission Info */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Submission Info
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {submission.submittedAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Submitted
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Submission ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                  #{submission.id}
                </Typography>
              </Box>

              {submission.hackathonId && (
                <Box>
                  <Button
                    variant="text"
                    onClick={() => navigate(`/hackathons/${submission.hackathonId}`)}
                    sx={{ p: 0, justifyContent: 'flex-start' }}
                  >
                    View Hackathon Details →
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SubmissionDetailsPage; 