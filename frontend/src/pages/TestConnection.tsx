import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { testAPI } from '../services/api';

const TestConnection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testGetConnection = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await testAPI.get();
      setResult(`✅ GET Test Success: ${response.data}`);
    } catch (err: any) {
      setError(`❌ GET Test Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPostConnection = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await testAPI.post('Hello from frontend!');
      setResult(`✅ POST Test Success: ${response.data}`);
    } catch (err: any) {
      setError(`❌ POST Test Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Backend Connection Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test API Endpoints
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={testGetConnection}
            disabled={loading}
          >
            Test GET /test
          </Button>
          
          <Button 
            variant="contained" 
            onClick={testPostConnection}
            disabled={loading}
          >
            Test POST /test
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography>Testing connection...</Typography>
          </Box>
        )}

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {result}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Connection Info
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Backend URL: http://localhost:8080
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Frontend URL: http://localhost:5173
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> If tests fail, ensure:
          </Typography>
          <ul>
            <li>Backend server is running on port 8080</li>
            <li>CORS is properly configured in the backend</li>
            <li>No firewall blocking the connection</li>
          </ul>
        </Box>
      </Paper>
    </Box>
  );
};

export default TestConnection; 