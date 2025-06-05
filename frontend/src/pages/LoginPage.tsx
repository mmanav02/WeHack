import { Box, Typography, TextField, Button, Stack, Container, Link } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        console.log('Login successful');
        navigate('/hackathons'); // Redirect to hackathons page after successful login
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Invalid credentials.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address or Username"
            name="email"
            autoComplete="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
          />
          {error && <Typography color="error" align="center">{error}</Typography>}
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
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