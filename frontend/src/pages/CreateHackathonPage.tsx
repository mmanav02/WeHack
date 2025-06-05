import { Typography, Container, Paper, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import React, { useState } from 'react';
import { hackathonAPI } from '../services/api';

const CreateHackathonPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // Consider using a date picker component
  const [scoringMethod, setScoringMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Placeholder userId - replace with actual authenticated user ID
  const placeholderUserId = 1;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    // Basic validation (add more as needed)
    if (!title || !description || !date || !scoringMethod) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await hackathonAPI.create({
        userId: placeholderUserId,
        title,
        description,
        date,
        scoringMethod,
      });
      console.log('Hackathon created successfully:', response.data);
      setSuccess('Hackathon created successfully!');
      // Optionally clear form or redirect
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
              label="Date (YYYY-MM-DD)" // Indicate expected format
              value={date}
              onChange={(e) => setDate(e.target.value)}
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