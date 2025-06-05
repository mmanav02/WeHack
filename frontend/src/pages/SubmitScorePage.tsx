import { Typography, Container, Paper } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

const SubmitScorePage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit Score
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a placeholder page for submitting a score for submission {submissionId}.
          You will need to fetch submission details, create a form for entering scores,
          and connect it to the backend's POST /judge/score endpoint.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SubmitScorePage; 