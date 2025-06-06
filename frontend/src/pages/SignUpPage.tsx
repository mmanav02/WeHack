import { Box, Typography, TextField, Button, Stack, Container, Link } from '@mui/material'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from state or default to home page
  const returnTo = location.state?.returnTo || '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const success = await register({ 
        username: name,
        email, 
        password 
      });
      if (success) {
        setSuccess('Registration successful!');
        navigate(returnTo); // Redirect to the return URL (home by default)
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Sign Up
      </Typography>
      
      {/* Show message if user was redirected from registration */}
      {location.state?.returnTo && location.state.returnTo.includes('/register') && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText" align="center">
            Create an account to continue with your hackathon registration
          </Typography>
        </Box>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error && !name}
          />
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error && !email}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && !password}
          />
          <TextField
            required
            fullWidth
            id="confirmPassword"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error}
          />
          {error && <Typography color="error" align="center">{error}</Typography>}
          {success && <Typography color="success.main" align="center">{success}</Typography>}
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Stack>
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account? <Link component={RouterLink} to="/login" state={{ returnTo }} variant="body2" color="primary">Sign In</Link>
        </Typography>
      </Box>
    </Container>
  )
}

export default SignUpPage 