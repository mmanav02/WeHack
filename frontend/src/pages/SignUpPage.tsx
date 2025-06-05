import { Box, Typography, TextField, Button, Stack, Container, Link } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const success = await register({ name, email, password });
      if (success) {
        setSuccess('Registration successful!');
        navigate('/hackathons'); // Redirect after successful registration
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error && password !== confirmPassword}
            helperText={error && password !== confirmPassword ? error : ''}
          />
          {error && password === confirmPassword && <Typography color="error">{error}</Typography>}
          {success && <Typography color="success.main">{success}</Typography>}
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
          Already have an account? <Link component={RouterLink} to="/login" variant="body2" color="primary">Log In</Link>
        </Typography>
      </Box>
    </Container>
  )
}

export default SignUpPage 