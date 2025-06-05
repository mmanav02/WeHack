import { Typography, Container, Paper } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

const SubmissionDetailsPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submission Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a placeholder page for displaying details of a specific submission (ID: {submissionId}).
          You will need to fetch submission details and potentially the final score from the backend and display them here.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SubmissionDetailsPage; 