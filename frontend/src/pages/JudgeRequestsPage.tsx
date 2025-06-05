import { Typography, Container, Paper } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

const JudgeRequestsPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Judge Requests for Hackathon {hackathonId}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a placeholder page for viewing and managing judge requests.
          You will need to fetch pending judge requests for this hackathon ({hackathonId}) from the backend's /hackathon-role/hackathons/{hackathonId}/judge-requests endpoint and build the UI to display and update statuses.
        </Typography>
      </Paper>
    </Container>
  );
};

export default JudgeRequestsPage; 