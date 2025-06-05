import { Typography, Container, Paper } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

const EditSubmissionPage: React.FC = () => {
  const { hackathonId, submissionId } = useParams<{ hackathonId: string; submissionId: string }>();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Submission
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a placeholder page for editing a submission.
          You will need to fetch the submission details for hackathon {hackathonId} and submission {submissionId},
          populate a form with the existing data, and connect it to the backend's PUT /submissions/{hackathonId}/user/[userId]/submission/{submissionId} endpoint.
        </Typography>
      </Paper>
    </Container>
  );
};

export default EditSubmissionPage; 