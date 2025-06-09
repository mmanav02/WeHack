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
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Chip,
  Stack
} from '@mui/material';
import {
  Upload as UploadIcon,
  Send as SendIcon,
  Description as ProjectIcon,
  Link as LinkIcon,
  AttachFile as FileIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { submissionAPI } from '../services/api';
import { SubmissionBuilder, createSubmissionBuilder } from '../utils/SubmissionBuilder';

const SubmitProjectPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Builder pattern state
  const [submissionBuilder, setSubmissionBuilder] = useState<SubmissionBuilder>(() => 
    createSubmissionBuilder()
      .forHackathon(parseInt(hackathonId!))
      .byUser(user?.id || 0)
  );

  const [loading, setLoading] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states - matching backend API exactly
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Form validation states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/hackathons/${hackathonId}/submit-project` } });
    } else if (hackathonId) {
      // Update builder with correct user ID
      setSubmissionBuilder(prev => prev.byUser(user.id));
    }
  }, [user, hackathonId, navigate]);

  // Update builder when form fields change
  useEffect(() => {
    setSubmissionBuilder(prev => prev
      .title(title)
      .description(description)
      .projectUrl(projectUrl)
    );
    
    if (file) {
      setSubmissionBuilder(prev => prev.file(file));
    }
  }, [title, description, projectUrl, file]);

  const validateForm = () => {
    const validation = submissionBuilder.asFinalSubmission().validate();
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]); // Clear validation errors when file is selected
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !hackathonId || !submissionBuilder.hasMinimumData()) {
      setError('Please add some content before saving draft');
      return;
    }

    try {
      setDraftSaving(true);
      setError(''); // Clear any previous errors
      
      const draftBuilder = submissionBuilder.clone().asDraft();
      const formData = draftBuilder.buildDraft();
      
      console.log('💾 Saving draft submission...');
      await submissionAPI.saveDraft(formData);
      
      console.log('✅ Draft saved successfully');
      
    } catch (err: any) {
      console.error('⚠️ Draft save failed:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setDraftSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !hackathonId) {
      setError('Missing user or hackathon information');
      return;
    }

    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Submitting final project...');
      
      const finalBuilder = submissionBuilder.asFinalSubmission();
      const formData = finalBuilder.build();
      
      console.log('📊 Submission completion:', finalBuilder.getCompletionPercentage() + '%');

      const response = await submissionAPI.submitProject(formData);
      console.log('✅ Project submitted successfully:', response.data);

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate(`/hackathons/${hackathonId}`);
      }, 3000);

    } catch (err: any) {
      console.error('❌ Project submission failed:', err);
      
      const errorMessage = typeof err.response?.data === 'string' ? err.response.data : '';
      
      if (errorMessage.includes('60 seconds')) {
        setError('⏱️ Please wait 60 seconds before submitting again.');
      } else if (errorMessage.includes('File upload failed')) {
        setError('File upload failed. Please try with a smaller file.');
      } else if (errorMessage.includes('Team not found')) {
        setError('You need to join the hackathon first. Please register for the hackathon.');
      } else if (err.response?.status === 500) {
        setError('Server error occurred. Please check the backend logs and try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to submit project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <SendIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
              Project Submitted Successfully! 🎉
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your project "{title}" has been submitted to the hackathon!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Thank you for participating. Your submission will be evaluated by judges when the judging phase begins.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Redirecting to hackathon details in 3 seconds...
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/hackathons/${hackathonId}`)}
              >
                Back to Hackathon
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/submissions')}
              >
                View All Submissions
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <ProjectIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Submit Your Project
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Share your amazing creation with the hackathon community!
        </Typography>
        <Divider sx={{ maxWidth: 200, mx: 'auto', mt: 2 }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Please fix the following issues:</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Project Title */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={validationErrors.some(error => error.includes('Title'))}
                  helperText={
                    validationErrors.find(error => error.includes('Title')) || 
                    "Give your project a catchy, descriptive name"
                  }
                  placeholder="e.g., AI-Powered Health Assistant"
                  disabled={loading}
                />
              </Grid>

              {/* Project Description */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  label="Project Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={validationErrors.some(error => error.includes('Description'))}
                  helperText={
                    validationErrors.find(error => error.includes('Description')) || 
                    "Describe what your project does, the problem it solves, and technologies used"
                  }
                  placeholder="Explain your project's purpose, features, technology stack, and impact..."
                  disabled={loading}
                />
              </Grid>

              {/* Project URL */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project URL (GitHub, Demo, etc.)"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  error={validationErrors.some(error => error.includes('URL'))}
                  helperText={
                    validationErrors.find(error => error.includes('URL')) || 
                    "Optional: Link to your GitHub repo, live demo, or project website"
                  }
                  placeholder="https://github.com/username/project or https://myproject.com"
                  disabled={loading}
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <FormControl fullWidth error={validationErrors.some(error => error.includes('File'))}>
                  <InputLabel shrink htmlFor="file-upload">
                    Project File Upload *
                  </InputLabel>
                  <Box sx={{ mt: 2 }}>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      disabled={loading}
                      inputProps={{
                        accept: ".zip,.rar,.tar.gz,.pdf,.doc,.docx,.txt,.md"
                      }}
                      sx={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<FileIcon />}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      >
                        Choose File
                      </Button>
                    </label>
                    {file && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                        ✅ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                    )}
                  </Box>
                  <FormHelperText>
                    {validationErrors.find(error => error.includes('File')) || 
                     "Upload your project files (source code, documentation, etc.) - Max 50MB"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                  {/* Save Draft Button */}
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={loading || draftSaving || !submissionBuilder.hasMinimumData()}
                    sx={{ px: 3 }}
                  >
                    {draftSaving ? 'Saving...' : 'Save Draft'}
                  </Button>

                  {/* Submit Final Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !validateForm()}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
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
                        background: 'grey.400',
                        transform: 'none',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Project'}
                  </Button>
                </Stack>

                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Make sure all required fields are filled before submitting
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubmitProjectPage; 