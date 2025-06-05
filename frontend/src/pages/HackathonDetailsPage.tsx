import { Typography, Container, Paper } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

const HackathonDetailsPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hackathon Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a placeholder page for displaying details of a specific hackathon (ID: {hackathonId}).
          You will need to fetch hackathon details from the backend and display them here.
          This page could also include options to join/leave, view submissions, or manage judge requests.
        </Typography>
      </Paper>
    </Container>
  );
};

export default HackathonDetailsPage; 