import { Box, Typography, TextField, Button, Stack, Container, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Login
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address or Username"
            name="email"
            autoComplete="email"
            variant="outlined"
          />
          <TextField
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            variant="outlined"
          />
          <Button type="submit" fullWidth variant="contained" size="large">
            Sign In
          </Button>
        </Stack>
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account? <Link component={RouterLink} to="/register" variant="body2" color="primary">Sign Up</Link>
        </Typography>
      </Box>
    </Container>
  )
}

export default LoginPage 