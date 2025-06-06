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
  FormHelperText
} from '@mui/material';
import {
  Upload as UploadIcon,
  Send as SendIcon,
  Description as ProjectIcon,
  Link as LinkIcon,
  AttachFile as FileIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { submissionAPI } from '../services/api';

const SubmitProjectPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states - matching backend API exactly
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Form validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [projectUrlError, setProjectUrlError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/hackathons/${hackathonId}/submit-project` } });
    }
  }, [user, hackathonId, navigate]);

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setTitleError('');
    setDescriptionError('');
    setProjectUrlError('');
    setFileError('');

    // Title validation
    if (!title.trim()) {
      setTitleError('Project title is required');
      isValid = false;
    } else if (title.trim().length < 3) {
      setTitleError('Title must be at least 3 characters long');
      isValid = false;
    }

    // Description validation
    if (!description.trim()) {
      setDescriptionError('Project description is required');
      isValid = false;
    } else if (description.trim().length < 10) {
      setDescriptionError('Description must be at least 10 characters long');
      isValid = false;
    }

    // Project URL validation (optional but if provided, should be valid)
    if (projectUrl.trim() && !isValidUrl(projectUrl.trim())) {
      setProjectUrlError('Please enter a valid URL (e.g., https://github.com/username/project)');
      isValid = false;
    }

    // File validation
    if (!file) {
      setFileError('Please upload a project file');
      isValid = false;
    } else if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setFileError('File size must be less than 50MB');
      isValid = false;
    }

    return isValid;
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (fileError) setFileError('');
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
      // Create FormData exactly matching backend API
      const formData = new FormData();
      formData.append('hackathonId', hackathonId);
      formData.append('userId', user.id.toString());
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('projectUrl', projectUrl.trim());
      formData.append('file', file!);

      console.log('🚀 Submitting project with data:');
      console.log('- hackathonId:', hackathonId);
      console.log('- userId:', user.id);
      console.log('- title:', title.trim());
      console.log('- description:', description.trim());
      console.log('- projectUrl:', projectUrl.trim());
      console.log('- file:', file?.name);

      // Call backend API endpoint exactly as designed
      const response = await submissionAPI.submitProject(formData);
      console.log('✅ Project submitted successfully:', response.data);

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate(`/hackathons/${hackathonId}`);
      }, 3000);

    } catch (err: any) {
      console.error('❌ Project submission failed:', err);
      
      // Handle specific error cases
      if (err.response?.data?.includes('60 seconds')) {
        setError('⏱️ Please wait 60 seconds before submitting again.');
      } else if (err.response?.data?.includes('File upload failed')) {
        setError('File upload failed. Please try with a smaller file.');
      } else if (err.response?.data?.includes('Team not found')) {
        setError('You need to join the hackathon first. Please register for the hackathon.');
      } else {
        setError(err.response?.data || err.message || 'Failed to submit project. Please try again.');
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
                  error={!!titleError}
                  helperText={titleError || "Give your project a catchy, descriptive name"}
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
                  error={!!descriptionError}
                  helperText={descriptionError || "Describe what your project does, the problem it solves, and technologies used"}
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
                  error={!!projectUrlError}
                  helperText={projectUrlError || "Optional: Link to your GitHub repo, live demo, or project website"}
                  placeholder="https://github.com/username/project or https://myproject.com"
                  disabled={loading}
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!fileError}>
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
                    {fileError || "Upload your project files (source code, documentation, etc.) - Max 50MB"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
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
                        background: 'grey.300',
                        transform: 'none',
                      }
                    }}
                  >
                    {loading ? 'Submitting Project...' : 'Submit Project'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              📋 Submission Guidelines
            </Typography>
            <Typography variant="body2" color="textSecondary" component="div">
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Make sure your project title is descriptive and unique</li>
                <li>Include technical details, challenges faced, and solutions in description</li>
                <li>Provide GitHub repo or demo links if available</li>
                <li>Upload source code, documentation, or project demos</li>
                <li>Supported file formats: .zip, .rar, .tar.gz, .pdf, .doc, .docx, .txt, .md</li>
                <li>Maximum file size: 50MB</li>
              </Box>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubmitProjectPage; 