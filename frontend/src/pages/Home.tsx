import { Box, Typography, Grid, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import HackathonList from '../components/HackathonList'

const Home = () => {
  const navigate = useNavigate()

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          paddingY: 8,
          // Consider adding a background image or color here to make it stand out
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to WeHack
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ marginBottom: 4 }}>
          Discover and share amazing projects from developers around the world
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/hackathons')}
        >
          Explore Hackathons
        </Button>
      </Box>

      {/* Additional Content Sections */}
      <Container maxWidth="lg" sx={{ paddingY: 8 }}>
        <Grid container spacing={4}>
          {/* Section 1: Share Your Work */}
          <Grid item xs={12} md={4}>
            <Box sx={{ padding: 3, borderRadius: 2, border: '1px solid grey' }}>
              <Typography variant="h6" gutterBottom>Share Your Work</Typography>
              <Typography color="text.secondary">
                Showcase your projects to the world. Get feedback, recognition, and connect with other developers.
              </Typography>
            </Box>
          </Grid>

          {/* Section 2: Discover Projects */}
          <Grid item xs={12} md={4}>
            <Box sx={{ padding: 3, borderRadius: 2, border: '1px solid grey' }}>
              <Typography variant="h6" gutterBottom>Discover Projects</Typography>
              <Typography color="text.secondary">
                Explore innovative projects from developers worldwide. Get inspired and learn from others.
              </Typography>
            </Box>
          </Grid>

          {/* Section 3: Connect & Collaborate */}
          <Grid item xs={12} md={4}>
            <Box sx={{ padding: 3, borderRadius: 2, border: '1px solid grey' }}>
              <Typography variant="h6" gutterBottom>Connect & Collaborate</Typography>
              <Typography color="text.secondary">
                Find like-minded developers, collaborate on projects, and build something amazing together.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Hackathons Section */}
      <Container maxWidth="lg" sx={{ paddingY: 8 }}>
         <Typography variant="h4" gutterBottom textAlign="center">
           Featured Hackathons
         </Typography>
         <HackathonList limit={3} showActionsOnly={false} />
       </Container>

    </Box>
  )
}

export default Home