import { Box, Typography, Grid, Container } from '@mui/material'

const About = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', paddingY: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          About WeHack
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, margin: '0 auto' }}>
          WeHack is a platform where developers can showcase their projects, connect with other developers,
          and get inspired by amazing creations from the community.
        </Typography>
      </Box>

      {/* Content Blocks */}
      <Container maxWidth="lg" sx={{ paddingY: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{
              backgroundColor: '#303030', // Darker background color
              padding: 3,
              borderRadius: 2,
              boxShadow: 3, // Adjusted shadow
              color: 'white' // Ensure text is visible on dark background
            }}>
              <Typography variant="h6" gutterBottom>Share Your Work</Typography>
              <Typography variant="body2" color="text.secondary">
                Showcase your projects to the world. Get feedback, recognition, and connect with other developers.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{
              backgroundColor: '#303030', // Darker background color
              padding: 3,
              borderRadius: 2,
              boxShadow: 3, // Adjusted shadow
              color: 'white' // Ensure text is visible on dark background
            }}>
              <Typography variant="h6" gutterBottom>Discover Projects</Typography>
              <Typography variant="body2" color="text.secondary">
                Explore innovative projects from developers worldwide. Get inspired and learn from others.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{
              backgroundColor: '#303030', // Darker background color
              padding: 3,
              borderRadius: 2,
              boxShadow: 3, // Adjusted shadow
              color: 'white' // Ensure text is visible on dark background
            }}>
              <Typography variant="h6" gutterBottom>Connect & Collaborate</Typography>
              <Typography variant="body2" color="text.secondary">
                Find like-minded developers, collaborate on projects, and build something amazing together.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Join Our Community Section */}
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Box sx={{
          backgroundColor: '#e3f2fd', // Light blue background
          padding: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h5" gutterBottom color="text.primary">
            Join Our Community
          </Typography>
          <Typography color="text.secondary">
            Be part of a growing community of developers who are passionate about creating and sharing.
            Start sharing your projects today!
          </Typography>
          {/* Add a button here if desired */}
        </Box>
      </Container>

    </Box>
  )
}

export default About