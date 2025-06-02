import { Box, Typography, TextField, Button, Stack, Container, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const SignUpPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Sign Up
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            variant="outlined"
          />
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
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
            autoComplete="new-password"
            variant="outlined"
          />
          <TextField
            required
            fullWidth
            id="confirm-password"
            label="Confirm Password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            variant="outlined"
          />
          <Button type="submit" fullWidth variant="contained" size="large">
            Sign Up
          </Button>
        </Stack>
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account? <Link component={RouterLink} to="/login" variant="body2" color="primary">Log In</Link>
        </Typography>
      </Box>
    </Container>
  )
}

export default SignUpPage 