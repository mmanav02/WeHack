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
import { createSubmissionCollection, createParticipantCollection } from '../utils/UICollectionFactory';
import type { SubmissionCollection, SubmissionUIItem, ParticipantCollection } from '../utils/UICollectionFactory';

interface UserRole {
  hackathonId: number;
  role: string;
  status: string;
}

const SubmissionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submissionCollection, setSubmissionCollection] = useState<SubmissionCollection | null>(null);
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
        setSubmissionCollection(null);
        setLoading(false);
        return;
      }
      
      // Fetch user roles first to determine if user is a judge
      const currentUserRoles = await fetchUserRoles();
      
      // Check if user is a judge for any hackathon
      const isJudge = currentUserRoles.some((role: UserRole) => role.role === 'JUDGE' && role.status === 'APPROVED');
      setIsJudge(isJudge);
      
      // Fetch submissions and create collection using Factory pattern
      let submissionData: any[] = [];
      let userRole: string | undefined;

      if (isJudge) {
        // Fetch all submissions if user is a judge
        try {
          const hackathonsResponse = await hackathonAPI.getAll();
          const allHackathons = hackathonsResponse.data;
          
          // Get submissions from all hackathons where user is an approved judge
          for (const hackathon of allHackathons) {
            const userJudgeRole = currentUserRoles.find(role => 
              role.hackathonId === hackathon.id && 
              role.role === 'JUDGE' && 
              role.status === 'APPROVED'
            );
            
            if (userJudgeRole) {
              try {
                const submissionsResponse = await submissionAPI.getByHackathon(hackathon.id);
                const hackathonSubmissions = submissionsResponse.data.map((sub: any) => ({
                  ...sub,
                  hackathonName: hackathon.title
                }));
                submissionData.push(...hackathonSubmissions);
              } catch (err) {
                console.log(`No submissions found for hackathon ${hackathon.id}`);
              }
            }
          }
          userRole = 'JUDGE';
        } catch (err) {
          console.error('Failed to fetch judge submissions:', err);
        }
      } else {
        // Fetch user's own submissions
        try {
          const response = await submissionAPI.getByUser(user.id);
          submissionData = response.data;
          userRole = 'PARTICIPANT';
        } catch (err) {
          console.error('Failed to fetch user submissions:', err);
        }
      }

      // Create submission collection using Factory pattern
      const collection = createSubmissionCollection(submissionData, user.id, userRole);
      setSubmissionCollection(collection);
      
      console.log(`📊 Loaded ${collection.count} submissions using Factory pattern (Role: ${userRole})`);
      
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

  const handleEditSubmission = (submissionId: number) => {
    navigate(`/submissions/${submissionId}/edit`);
  };

  const handleJudgeSubmission = (submissionId: number) => {
    navigate(`/submissions/${submissionId}/judge`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading submissions using Factory pattern...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          Please log in to view your submissions.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchData}>
          Retry
        </Button>
      </Container>
    );
  }

  // Use Factory pattern collections for filtering
  const allSubmissions = submissionCollection?.toArray() || [];
  const userSubmissions = submissionCollection?.getUserSubmissions(user.id).toArray() || [];
  const judgeableSubmissions = submissionCollection?.getJudgeableSubmissions().toArray() || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          <SubmissionIcon sx={{ fontSize: 'inherit', mr: 1, verticalAlign: 'text-bottom' }} />
          Submissions
        </Typography>
        
        {/* Factory pattern metadata display */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={`Total: ${submissionCollection?.count || 0}`} 
            color="primary" 
            variant="outlined" 
          />
          {isJudge && (
            <Chip 
              label={`Judgeable: ${judgeableSubmissions.length}`} 
              color="secondary" 
              variant="outlined" 
              icon={<JudgeIcon />}
            />
          )}
          <Chip 
            label={`Your Submissions: ${userSubmissions.length}`} 
            color="success" 
            variant="outlined" 
          />
        </Box>
        
        <Typography variant="h6" color="textSecondary">
          {isJudge 
            ? `Viewing all submissions as a judge (${allSubmissions.length} total)`
            : `Your submitted projects (${userSubmissions.length} submissions)`
          }
        </Typography>
      </Box>

      {/* Submissions Grid */}
      {allSubmissions.length === 0 ? (
        <Card elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <SubmissionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Submissions Found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {isJudge 
              ? "No submissions available for judging at the moment."
              : "You haven't submitted any projects yet."
            }
          </Typography>
          {!isJudge && (
            <Button 
              variant="contained" 
              onClick={() => navigate('/hackathons')}
              size="large"
            >
              Find Hackathons
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={3}>
          {allSubmissions.map((submission) => (
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

                  {/* Factory pattern metadata indicators */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {submission.metadata?.hasFile && (
                      <Chip 
                        icon={<FileIcon />} 
                        label="File" 
                        size="small" 
                        color="info" 
                        variant="outlined"
                      />
                    )}
                    {submission.metadata?.hasUrl && (
                      <Chip 
                        icon={<LinkIcon />} 
                        label="URL" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                    {submission.isPrimary && (
                      <Chip 
                        label="Primary" 
                        size="small" 
                        color="warning" 
                        variant="filled"
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
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewSubmission(submission.id)}
                  >
                    View
                  </Button>
                  
                  {/* Factory pattern metadata usage for conditional rendering */}
                  {submission.metadata?.canEdit && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEditSubmission(submission.id)}
                    >
                      Edit
                    </Button>
                  )}
                  
                  {submission.metadata?.canJudge && (
                    <Button
                      size="small"
                      color="secondary"
                      startIcon={<JudgeIcon />}
                      onClick={() => handleJudgeSubmission(submission.id)}
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