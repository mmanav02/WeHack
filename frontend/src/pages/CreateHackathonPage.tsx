import { Typography, Container, Paper, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Box, FormControlLabel, Checkbox, Alert } from '@mui/material';
import React, { useState } from 'react';
import { hackathonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateHackathonPage: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mailMode, setMailMode] = useState('MAILGUN');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to create a hackathon.');
      return;
    }

    // Basic validation (add more as needed)
    if (!title || !description || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }

    // Validate Gmail SMTP password when ORGANIZED mode is selected
    if (mailMode === 'ORGANIZED' && !smtpPassword.trim()) {
      setError('SMTP password is required when using Gmail notifications.');
      return;
    }

    // Validate that end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }

    try {
      // Convert dates to ISO string format for backend
      const startDateISO = new Date(startDate + 'T00:00:00.000Z').toISOString();
      const endDateISO = new Date(endDate + 'T23:59:59.999Z').toISOString();

      const response = await hackathonAPI.create({
        userId: user.id,
        title,
        description,
        startDate: startDateISO,
        endDate: endDateISO,
        scoringMethod: 'SIMPLE_AVERAGE', // Default value
        smtpPassword: mailMode === 'ORGANIZED' ? smtpPassword : '',
        mailMode,
        slackEnabled: true // Always enabled by default
      });
      console.log('Hackathon created successfully:', response.data);
      setSuccess('Hackathon created successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setMailMode('MAILGUN'); // Default to Mailgun (recommended)
      setSmtpPassword('');
    } catch (err) {
      console.error('Error creating hackathon:', err);
      setError('Failed to create hackathon. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Hackathon
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              label="Hackathon Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Hackathon Description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              required
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Mail Configuration Section */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                📧 Email Notifications
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Email Provider</InputLabel>
                <Select
                  value={mailMode}
                  onChange={(e) => setMailMode(e.target.value)}
                  label="Email Provider"
                >
                  <MenuItem value="NONE">
                    <Box>
                      <Typography variant="body1">None</Typography>
                      <Typography variant="caption" color="textSecondary">
                        No email notifications will be sent
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="MAILGUN">
                    <Box>
                      <Typography variant="body1">Mailgun Service ⭐ Recommended</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Professional email delivery service
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ORGANIZED">
                    <Box>
                      <Typography variant="body1">Gmail (Your Account)</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Use your Gmail account to send notifications
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Gmail SMTP Password Field - Only shown when ORGANIZED is selected */}
              {mailMode === 'ORGANIZED' && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="Gmail App Password"
                    placeholder="Enter your Gmail App Password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    helperText={
                      <Box component="span">
                        <strong>Note:</strong> Use a Gmail App Password, not your regular password.
                        <br />
                        Generate one at: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">Google App Passwords</a>
                      </Box>
                    }
                  />
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Gmail Setup Instructions:</strong>
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      1. Go to Google Account settings<br />
                      2. Enable 2-factor authentication<br />
                      3. Generate an App Password for "Mail"<br />
                      4. Use the 16-character App Password here
                    </Typography>
                  </Alert>
                </Box>
              )}

              {mailMode === 'MAILGUN' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Mailgun Service:</strong> Uses our configured Mailgun API for reliable, professional email delivery.
                    All judge notifications and hackathon updates will be sent automatically.
                  </Typography>
                </Alert>
              )}

              {mailMode === 'NONE' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>No Email Notifications:</strong> Judges and participants will not receive email updates 
                    about hackathon status changes. Consider using Mailgun for better communication.
                  </Typography>
                </Alert>
              )}
            </Box>

            {/* Slack Integration Notice - Always Enabled */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>💬 Slack Integration:</strong> Slack notifications are automatically enabled for all hackathons. 
                Notifications will be sent to the configured Slack channel in addition to email.
              </Typography>
            </Alert>

            {/* Error and Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              Create Hackathon
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateHackathonPage; 