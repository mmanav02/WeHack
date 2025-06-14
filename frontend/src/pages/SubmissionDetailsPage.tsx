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
  Comment as CommentIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  AttachFile as FileIcon,
  Edit as EditIcon
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
  filePath?: string;  // Add file path support
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
      
      // Now use the real API endpoint
      const response = await submissionAPI.getById(parseInt(submissionId!));
      const submissionData = response.data;
      
      if (submissionData) {
        // Map backend data to frontend interface
        const submission: Submission = {
          id: submissionData.id,
          title: submissionData.title || `Submission ${submissionData.id}`,
          description: submissionData.description || 'No description provided.',
          teamName: submissionData.team?.name || `Team ${submissionData.team?.id || 'Unknown'}`,
          projectUrl: submissionData.projectUrl,
          repoUrl: submissionData.repoUrl, // This field might not exist in backend yet
          technology: submissionData.technology || [], // This field might not exist in backend yet
          submittedAt: submissionData.submitTime,
          hackathonId: submissionData.hackathon?.id,
          hackathonName: submissionData.hackathon?.title || 'Unknown Hackathon',
          filePath: submissionData.filePath
        };
        
        setSubmission(submission);
        console.log('📋 Found submission:', submission);
      } else {
        setError('Submission not found. It may have been deleted or you may not have permission to view it.');
      }
      
    } catch (err: any) {
      console.error('Failed to fetch submission:', err);
      if (err.response?.status === 404) {
        setError('Submission not found. It may have been deleted or you may not have permission to view it.');
      } else {
        setError('Failed to load submission details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeSubmission = () => {
    navigate(`/submissions/${submissionId}/score`);
  };

  const handleEditSubmission = () => {
    navigate(`/submissions/${submissionId}/edit`);
  };

  const handleDownloadFile = async () => {
    if (!submission || !submission.filePath) return;

    try {
      const response = await submissionAPI.downloadFile(submission.id);
      
      // Create a blob from the response
      const blob = new Blob([response.data]);
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from filePath if available
      const filename = submission.filePath.includes('/') 
        ? submission.filePath.split('/').pop() || 'submission_file'
        : submission.filePath;
      
      // Remove timestamp prefix if it exists (format: timestamp_originalname)
      const cleanFilename = filename.includes('_') 
        ? filename.substring(filename.indexOf('_') + 1)
        : filename;
        
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error('Failed to download file:', err);
      setError('Failed to download file. Please try again.');
    }
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

          {/* Project Links and Files */}
          {(submission.projectUrl || submission.repoUrl || submission.filePath) && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinkIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Project Resources
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {submission.projectUrl && (
                    <Button
                      variant="outlined"
                      href={submission.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LinkIcon />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      🔗 Project Link
                    </Button>
                  )}
                  {submission.repoUrl && (
                    <Button
                      variant="outlined"
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<CodeIcon />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      📁 Source Code Repository
                    </Button>
                  )}
                  {submission.filePath && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleDownloadFile}
                      startIcon={<DownloadIcon />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      📎 Download Submitted Files
                    </Button>
                  )}
                </Box>
                
                {/* File Info */}
                {submission.filePath && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileIcon sx={{ mr: 1, fontSize: 16 }} />
                      <strong>Submitted File:</strong>&nbsp;
                      {submission.filePath.includes('/') 
                        ? submission.filePath.split('/').pop()?.replace(/^\d+_/, '') || 'Unknown file'
                        : submission.filePath.replace(/^\d+_/, '')
                      }
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      💡 Click "Download Submitted Files" above to access the team's submission files
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {user && (
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <JudgeIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleEditSubmission}
                    startIcon={<EditIcon />}
                    color="primary"
                  >
                    Edit Submission
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleJudgeSubmission}
                    startIcon={<JudgeIcon />}
                  >
                    Submit Score
                  </Button>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  💡 Use version control features when editing to keep track of changes
                </Typography>
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