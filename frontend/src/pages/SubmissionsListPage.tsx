import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assignment as SubmissionIcon,
  Gavel as JudgeIcon,
  Visibility as ViewIcon,
  Group as TeamIcon,
  AttachFile as FileIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { submissionAPI, hackathonRoleAPI, hackathonAPI, hackathonRegistrationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Submission {
  id: number;
  title: string;
  description: string;
  teamName?: string;
  hackathonId?: number;
  hackathonName?: string;
  submittedAt?: string;
  projectUrl?: string;
  filePath?: string;
}

interface UserRole {
  hackathonId: number;
  role: string;
  status: string;
}

const SubmissionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJudge, setIsJudge] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Fetch user roles first to determine if user is a judge
      const currentUserRoles = await fetchUserRoles();
      
      // Check if user is a judge for any hackathon
      const isJudge = currentUserRoles.some((role: UserRole) => role.role === 'JUDGE' && role.status === 'APPROVED');
      setIsJudge(isJudge);
      
      if (isJudge) {
        // For judges: Fetch primary submissions from all hackathons they're judging
        const allSubmissions: any[] = [];
        
        // Get hackathons where user is an approved judge
        const judgeHackathons = currentUserRoles
          .filter((role: UserRole) => role.role === 'JUDGE' && role.status === 'APPROVED')
          .map((role: UserRole) => role.hackathonId);
        
        for (const hackathonId of judgeHackathons) {
          try {
            const response = await submissionAPI.getPrimarySubmissions(hackathonId);
            if (response.data && response.data.length > 0) {
              allSubmissions.push(...response.data);
            }
          } catch (err) {
            console.log(`No primary submissions found for hackathon ${hackathonId}`);
          }
        }
        
        if (allSubmissions.length > 0) {
          const primarySubmissions = allSubmissions.map((submission: any) => ({
            id: submission.id,
            title: submission.title || `Submission ${submission.id}`,
            description: submission.description || 'No description available',
            teamName: submission.team?.name || `Team ${submission.teamId}`,
            hackathonId: submission.hackathon?.id || submission.hackathonId,
            hackathonName: submission.hackathon?.title || `Hackathon ${submission.hackathonId}`,
            submittedAt: submission.submitTime || new Date().toISOString(),
            projectUrl: submission.projectUrl,
            filePath: submission.filePath
          }));
          setSubmissions(primarySubmissions);
          console.log(`⭐ Found ${primarySubmissions.length} primary submissions for judge ${user.email}`);
        } else {
          setSubmissions([]);
        }
      } else {
        // For participants: Fetch only current user's submissions
        try {
          const response = await submissionAPI.getByUser(user.id);
          if (response.data && response.data.length > 0) {
            const userSubmissions = response.data.map((submission: any) => ({
              id: submission.id,
              title: submission.title || `Submission ${submission.id}`,
              description: submission.description || 'No description available',
              teamName: submission.team?.name || `Team ${submission.teamId}`,
              hackathonId: submission.hackathon?.id || submission.hackathonId,
              hackathonName: submission.hackathon?.title || `Hackathon ${submission.hackathonId}`,
              submittedAt: submission.submitTime || new Date().toISOString(),
              projectUrl: submission.projectUrl,
              filePath: submission.filePath
            }));
            setSubmissions(userSubmissions);
            console.log(`📋 Found ${userSubmissions.length} submissions for user ${user.email}`);
          } else {
            setSubmissions([]);
          }
        } catch (err) {
          console.error('Failed to fetch user submissions:', err);
          setSubmissions([]);
        }
      }
      
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async (): Promise<UserRole[]> => {
    try {
      if (!user) return [];
      
      // Get all hackathons to check judge status for each
      const hackathonsResponse = await hackathonAPI.getAll();
      const allHackathons = hackathonsResponse.data;
      
      const currentUserRoles: UserRole[] = [];
      
      // Check judge status for each hackathon
      for (const hackathon of allHackathons) {
        try {
          const judgeRequestsResponse = await hackathonRegistrationAPI.getPendingJudgeRequests(hackathon.id);
          const judgeRequests = judgeRequestsResponse.data || [];
          
          // Find current user's judge request
          const userJudgeRequest = judgeRequests.find((request: any) => 
            request.user?.id === user.id || request.userId === user.id
          );
          
          if (userJudgeRequest) {
            currentUserRoles.push({
              hackathonId: hackathon.id,
              role: 'JUDGE',
              status: userJudgeRequest.status // PENDING, APPROVED, REJECTED
            });
          }
        } catch (err) {
          console.log(`No judge requests found for hackathon ${hackathon.id}`);
        }
      }
      
      console.log('🔍 User roles found:', currentUserRoles);
      setUserRoles(currentUserRoles);
      return currentUserRoles;
      
    } catch (err: any) {
      console.error('Failed to fetch user roles:', err);
      // Don't show error for roles, just continue without judge permissions
      setUserRoles([]);
      return [];
    }
  };

  const isUserJudgeForHackathon = (hackathonId: number): boolean => {
    if (!user || !userRoles.length) return false;
    
    const userRole = userRoles.find(role => 
      role.hackathonId === hackathonId && 
      role.role === 'JUDGE' && 
      role.status === 'APPROVED'
    );
    
    return !!userRole;
  };

  const handleViewSubmission = (submissionId: number) => {
    navigate(`/submissions/${submissionId}`);
  };

  const handleJudgeSubmission = (submissionId: number) => {
    navigate(`/submissions/${submissionId}/score`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading submissions...
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SubmissionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {isJudge ? 'Primary Submissions to Judge' : 'My Submissions'}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {isJudge 
            ? 'Review and score the primary submissions from teams' 
            : 'Browse and manage your hackathon submissions'
          }
        </Typography>
      </Box>

      {submissions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No Submissions Found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            No projects have been submitted to hackathons yet. Submissions will appear here once participants submit their projects.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            To submit a project, participants need to use the submission API endpoint after joining a hackathon.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/hackathons')}>
            View Hackathons
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {submissions.map((submission) => (
            <Grid item xs={12} md={6} lg={4} key={submission.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {submission.title}
                  </Typography>
                  
                  {submission.teamName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TeamIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {submission.teamName}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {submission.description.length > 120 
                      ? `${submission.description.substring(0, 120)}...` 
                      : submission.description}
                  </Typography>

                  {submission.hackathonName && (
                    <Chip 
                      label={submission.hackathonName}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}

                  {/* Resource Indicators */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    {submission.filePath && (
                      <Chip 
                        icon={<FileIcon />}
                        label="Files Available"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    {submission.projectUrl && (
                      <Chip 
                        icon={<LinkIcon />}
                        label="Project Link"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {submission.submittedAt && (
                    <Typography variant="caption" color="textSecondary">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewSubmission(submission.id)}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                  
                  {isUserJudgeForHackathon(submission.hackathonId || 0) && (
                    <Button
                      variant="contained"
                      startIcon={<JudgeIcon />}
                      onClick={() => handleJudgeSubmission(submission.id)}
                      color="primary"
                    >
                      Judge
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SubmissionsListPage; 