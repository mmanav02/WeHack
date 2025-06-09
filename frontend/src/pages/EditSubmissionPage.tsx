import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  History as HistoryIcon,
  Cancel as CancelIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { submissionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { hackathonAPI } from '../services/api';
import { SubmissionBuilder, createSubmissionBuilder } from '../utils/SubmissionBuilder';

interface Submission {
  id: number;
  title: string;
  description: string;
  projectUrl: string;
  hackathonId: number;
  teamId: number;
  filePath?: string;
  submitTime?: string;
}

interface VersionHistory {
  id: number;
  title: string;
  description: string;
  projectUrl: string;
  savedAt: string;
  filePath?: string;
  isPrimary?: boolean;
}

const EditSubmissionPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Builder pattern state
  const [submissionBuilder, setSubmissionBuilder] = useState<SubmissionBuilder | null>(null);

  // Form state
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hackathonStatus, setHackathonStatus] = useState<string>('');
  const [canEdit, setCanEdit] = useState(true);
  
  // Memento/Version state
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [hasUndoHistory, setHasUndoHistory] = useState(false);
  const [primaryVersionId, setPrimaryVersionId] = useState<number | null>(null);

  // Validation state - using Builder pattern validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionAPI.getById(parseInt(submissionId!));
      const submissionData = response.data;

      if (submissionData) {
        const submission: Submission = {
          id: submissionData.id,
          title: submissionData.title || '',
          description: submissionData.description || '',
          projectUrl: submissionData.projectUrl || '',
          hackathonId: submissionData.hackathon?.id || 0,
          teamId: submissionData.team?.id || 0,
          filePath: submissionData.filePath,
          submitTime: submissionData.submitTime
        };

        setSubmission(submission);
        setTitle(submission.title);
        setDescription(submission.description);
        setProjectUrl(submission.projectUrl);

        // Initialize Builder with existing submission data
        const builder = createSubmissionBuilder()
          .forHackathon(submission.hackathonId)
          .byUser(user?.id || 0)
          .title(submission.title)
          .description(submission.description)
          .projectUrl(submission.projectUrl);
        
        setSubmissionBuilder(builder);

        // Check hackathon status to determine if editing is allowed
        try {
          const hackathonsResponse = await hackathonAPI.getAll();
          const hackathon = hackathonsResponse.data.find((h: any) => h.id === submission.hackathonId);
          
          if (hackathon) {
            setHackathonStatus(hackathon.status);
            
            // Block editing if hackathon is in Judging or Completed state
            if (hackathon.status === 'Judging' || hackathon.status === 'Completed') {
              setCanEdit(false);
              setError(`⚠️ Editing is disabled during ${hackathon.status} phase. Submissions are locked for integrity.`);
            } else {
              setCanEdit(true);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch hackathon status:', err);
          // Allow editing if we can't fetch status (fail-safe)
          setCanEdit(true);
        }

        // Check if there's undo history available (simplified check)
        setHasUndoHistory(true); // Assume there's history for now
      } else {
        setError('Submission not found.');
      }
    } catch (err: any) {
      console.error('Failed to fetch submission:', err);
      setError('Failed to load submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!submissionBuilder) return false;
    
    // Update builder with current form values
    const updatedBuilder = submissionBuilder
      .title(title)
      .description(description)
      .projectUrl(projectUrl);
    
    if (file) {
      updatedBuilder.file(file);
    }
    
    const validation = updatedBuilder.asFinalSubmission().validate();
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSave = async () => {
    if (!validateForm() || !submission || !user) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const editData = {
        hackathonId: submission.hackathonId,
        userId: user.id,
        submissionId: submission.id,
        title: title.trim(),
        description: description.trim(),
        projectUrl: projectUrl.trim(),
        file: file
      };

      await submissionAPI.edit(editData);
      
      setSuccess('Submission updated successfully! 🎉');
      setHasUndoHistory(true); // Now there's definitely history to undo
      
      // Update local state
      setSubmission(prev => prev ? {
        ...prev,
        title: title.trim(),
        description: description.trim(),
        projectUrl: projectUrl.trim()
      } : null);

    } catch (err: any) {
      console.error('Failed to save submission:', err);
      setError('Failed to save submission. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = async () => {
    if (!submission || !user) return;

    try {
      setUndoing(true);
      setError('');
      setSuccess('');

      const undoData = {
        teamId: submission.teamId,
        submissionId: submission.id,
        hackathonId: submission.hackathonId
      };

      const response = await submissionAPI.undoLastEdit(undoData);
      const restoredSubmission = response.data;

      if (restoredSubmission) {
        // Update form with restored data
        setTitle(restoredSubmission.title || '');
        setDescription(restoredSubmission.description || '');
        setProjectUrl(restoredSubmission.projectUrl || '');

        // Update submission state
        setSubmission(prev => prev ? {
          ...prev,
          title: restoredSubmission.title || '',
          description: restoredSubmission.description || '',
          projectUrl: restoredSubmission.projectUrl || ''
        } : null);

        setSuccess('Successfully restored previous version! ↶');
      }

    } catch (err: any) {
      console.error('Failed to undo:', err);
      if (err.response?.data?.message?.includes('No history')) {
        setError('No previous version available to restore.');
        setHasUndoHistory(false);
      } else {
        setError('Failed to undo changes. Please try again.');
      }
    } finally {
      setUndoing(false);
    }
  };

  const handleCancel = () => {
    navigate(`/submissions/${submissionId}`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSetPrimary = async (versionId: number) => {
    try {
      if (!user || !submission) return;
      
      // Call real API to set primary submission
      await submissionAPI.setPrimary(submission.id, user.id);
      
      setPrimaryVersionId(versionId);
      setSuccess(`Version set as primary submission! ⭐`);
      
      // Update the version history to reflect the change
      setVersionHistory(prev => prev.map(version => ({
        ...version,
        isPrimary: version.id === versionId
      })));
      
    } catch (err: any) {
      console.error('Failed to set primary version:', err);
      if (err.response?.status === 400) {
        setError('Cannot change primary submission during Judging or Completed phase.');
      } else {
        setError('Failed to set primary version. Please try again.');
      }
    }
  };

  const generateMockVersionHistory = (): VersionHistory[] => {
    if (!submission) return [];
    
    return [
      {
        id: Date.now(),
        title: title || submission.title,
        description: description || submission.description,
        projectUrl: projectUrl || submission.projectUrl,
        savedAt: new Date().toISOString(),
        filePath: submission.filePath,
        isPrimary: primaryVersionId === Date.now() || primaryVersionId === null // Current version is primary by default
      },
      {
        id: Date.now() - 1000,
        title: "Updated Project Title v2",
        description: "Improved project description with more details about implementation",
        projectUrl: "https://github.com/team/project-v2",
        savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isPrimary: primaryVersionId === (Date.now() - 1000)
      },
      {
        id: Date.now() - 2000,
        title: "Initial Project Submission",
        description: "First version of our hackathon project",
        projectUrl: "https://github.com/team/project-v1",
        savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isPrimary: primaryVersionId === (Date.now() - 2000)
      }
    ];
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="error">Submission not found or you don't have permission to edit it.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EditIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Edit Submission
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Submission ID: #{submission.id}
              </Typography>
            </Box>
          </Box>
          
          {/* Memento Controls */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Version History">
              <IconButton
                onClick={() => setShowVersionHistory(true)}
                color="primary"
                sx={{ bgcolor: 'action.hover' }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={hasUndoHistory ? "Undo Last Change" : "No changes to undo"}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={undoing ? <CircularProgress size={16} /> : <UndoIcon />}
                  onClick={handleUndo}
                  disabled={undoing || !hasUndoHistory}
                  sx={{ textTransform: 'none' }}
                >
                  {undoing ? 'Undoing...' : 'Undo'}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Edit Form */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              📝 Edit Project Details
            </Typography>

            {/* Progress and Status Bar */}
            {submissionBuilder && (
              <Card elevation={1} sx={{ mb: 3, bgcolor: 'grey.50' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Completion: {submissionBuilder.title(title).description(description).projectUrl(projectUrl).getCompletionPercentage()}%
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={hackathonStatus || 'Loading...'}
                        color={canEdit ? 'success' : 'error'}
                        size="small"
                      />
                      {canEdit && (
                        <Chip
                          label="Editable"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={submissionBuilder.title(title).description(description).projectUrl(projectUrl).getCompletionPercentage()} 
                    sx={{ borderRadius: 1, height: 6 }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
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

            <Stack spacing={3}>
              {/* Project Title */}
              <TextField
                required
                fullWidth
                label="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!validationErrors.find(e => e === 'Title is required') || !!validationErrors.find(e => e === 'Title must be at least 3 characters')}
                helperText={validationErrors.find(e => e === 'Title is required') || validationErrors.find(e => e === 'Title must be at least 3 characters') || "Give your project a descriptive title"}
                disabled={saving || !canEdit}
              />

              {/* Project Description */}
              <TextField
                required
                fullWidth
                multiline
                rows={8}
                label="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!validationErrors.find(e => e === 'Description is required') || !!validationErrors.find(e => e === 'Description must be at least 10 characters')}
                helperText={validationErrors.find(e => e === 'Description is required') || validationErrors.find(e => e === 'Description must be at least 10 characters') || "Describe your project's purpose, features, and technology"}
                disabled={saving || !canEdit}
              />

              {/* Project URL */}
              <TextField
                fullWidth
                label="Project URL (GitHub, Demo, etc.)"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                helperText="Optional: Link to your GitHub repo, live demo, or project website"
                disabled={saving || !canEdit}
              />

              {/* File Upload */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  📎 Update Project Files (Optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  disabled={saving || !canEdit}
                  sx={{ mb: 1 }}
                >
                  Choose New File
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx,.txt"
                    disabled={!canEdit}
                  />
                </Button>
                
                {file && (
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFileIcon fontSize="small" />
                      New file: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      <IconButton size="small" onClick={() => setFile(null)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                  </Box>
                )}

                {submission.filePath && !file && (
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Current file: {submission.filePath.split('/').pop()?.replace(/^\d+_/, '') || 'Unknown'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || undoing || !canEdit}
                  sx={{ textTransform: 'none' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving || undoing}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Memento Information Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                🧠 Version Control
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Save your changes to create new versions. You can undo changes to restore previous versions.
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Last Modified:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {submission.submitTime ? new Date(submission.submitTime).toLocaleString() : 'Unknown'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Undo Available:
                </Typography>
                <Chip 
                  label={hasUndoHistory ? "Yes" : "No"} 
                  color={hasUndoHistory ? "success" : "default"} 
                  size="small" 
                />
              </Box>

              <Button
                variant="text"
                startIcon={<HistoryIcon />}
                onClick={() => setShowVersionHistory(true)}
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                View Version History
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                🚀 Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => navigate(`/submissions/${submissionId}`)}
                  fullWidth
                  sx={{ textTransform: 'none' }}
                >
                  Preview Submission
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Version History Dialog */}
      <Dialog 
        open={showVersionHistory} 
        onClose={() => setShowVersionHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          Version History
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Here are the recent versions of your submission. You can restore any previous version.
          </Typography>

          <Stack spacing={2}>
            {generateMockVersionHistory().map((version, index) => (
              <Card key={version.id} elevation={1} sx={{ 
                bgcolor: version.isPrimary ? 'primary.light' : 
                         index === 0 ? 'action.selected' : 'background.paper',
                border: version.isPrimary ? 2 : 1,
                borderColor: version.isPrimary ? 'primary.main' : 'divider'
              }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {version.title}
                        </Typography>
                        {index === 0 && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                        {version.isPrimary && (
                          <Chip 
                            label="Primary" 
                            size="small" 
                            color="warning" 
                            icon={<StarIcon />}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {version.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Saved: {new Date(version.savedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                      {!version.isPrimary && (
                        <Tooltip title="Set as Primary Submission">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleSetPrimary(version.id)}
                          >
                            <StarBorderIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {index !== 0 && (
                        <Tooltip title="Restore this version">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={handleUndo}
                            disabled={undoing}
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditSubmissionPage; 