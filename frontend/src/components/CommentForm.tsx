import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface CommentFormProps {
  hackathonId: number;
  userId: number;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  hackathonId,
  userId,
  onSubmit,
  onCancel,
  placeholder = "Add a comment...",
  isReply = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Comment must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent('');
      if (onCancel) onCancel(); // Close reply form after submission
    } catch (error) {
      setError('Failed to post comment. Please try again.');
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    if (onCancel) onCancel();
  };

  return (
    <Paper 
      elevation={isReply ? 0 : 1} 
      sx={{ 
        p: isReply ? 1 : 2, 
        backgroundColor: isReply ? 'transparent' : 'background.paper',
        border: isReply ? '1px solid #e0e0e0' : 'none'
      }}
    >
      {!isReply && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Add Comment
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={isReply ? 2 : 3}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 1000 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {content.length}/1000 characters
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(isReply || onCancel) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              size="small"
              startIcon={<SendIcon />}
              disabled={isSubmitting || !content.trim()}
              sx={{ textTransform: 'none' }}
            >
              {isSubmitting ? 'Posting...' : (isReply ? 'Reply' : 'Post Comment')}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default CommentForm; 