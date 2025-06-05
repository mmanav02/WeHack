import { Box, Typography, Grid, TextField, Select, MenuItem, Stack, Card, CardContent } from '@mui/material'

const Projects = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        All Projects
      </Typography>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <TextField
          label="Search projects..."
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 400 } }}
        />
        <Select
          defaultValue="all"
          size="small"
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="web">Web Development</MenuItem>
          <MenuItem value="mobile">Mobile Apps</MenuItem>
          <MenuItem value="ai">AI/ML</MenuItem>
          <MenuItem value="game">Game Development</MenuItem>
        </Select>
      </Stack>

      <Grid container spacing={4}>
        {/* Project cards will be dynamically rendered here */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid xs={12} sm={6} md={4} key={item}>
            <Card sx={{ boxShadow: 1, '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Project {item}</Typography>
                <Typography color="text.secondary" sx={{ marginBottom: 2 }}>
                  Project description goes here...
                </Typography>
                <Typography color="primary" sx={{ fontWeight: 'medium' }}>
                  View Details →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Projects