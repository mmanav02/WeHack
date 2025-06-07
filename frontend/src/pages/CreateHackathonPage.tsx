import { Typography, Container, Paper, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import React, { useState } from 'react';
import { hackathonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateHackathonPage: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scoringMethod, setScoringMethod] = useState('');
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
    if (!title || !description || !startDate || !endDate || !scoringMethod) {
      setError('Please fill in all fields.');
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
        scoringMethod,
        smtpPassword: '', // Default empty
        mailMode: 'NONE' // Default value - use valid enum value
      });
      console.log('Hackathon created successfully:', response.data);
      setSuccess('Hackathon created successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setScoringMethod('');
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
            <FormControl fullWidth required>
              <InputLabel id="scoring-method-label">Scoring Method</InputLabel>
              <Select
                labelId="scoring-method-label"
                id="scoring-method"
                value={scoringMethod}
                label="Scoring Method"
                onChange={(e) => setScoringMethod(e.target.value)}
              >
                <MenuItem value="SIMPLE_AVERAGE">Simple Average</MenuItem>
                <MenuItem value="WEIGHTED_AVERAGE">Weighted Average</MenuItem>
              </Select>
            </FormControl>
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="success.main">{success}</Typography>}
            <Button type="submit" fullWidth variant="contained" size="large">
              Create Hackathon
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateHackathonPage; 