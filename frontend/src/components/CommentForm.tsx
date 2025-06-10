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
    <Box
      sx={{ 
        p: isReply ? 2 : 3, 
        backgroundColor: isReply ? '#424242' : 'background.paper',
        borderRadius: 2
      }}
    >
      {!isReply && (
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
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
          rows={isReply ? 3 : 4}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: isReply ? '#333333' : 'background.paper',
              color: isReply ? '#ffffff' : 'text.primary',
              '& input': {
                color: isReply ? '#ffffff' : 'text.primary'
              },
              '& textarea': {
                color: isReply ? '#ffffff' : 'text.primary'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isReply ? '#555555' : undefined
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            },
            '& .MuiInputLabel-root': {
              color: isReply ? '#cccccc' : 'text.secondary'
            }
          }}
          inputProps={{ 
            maxLength: 1000,
            style: { color: isReply ? '#ffffff' : undefined }
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color={isReply ? '#cccccc' : 'text.secondary'}>
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
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: isReply ? '#cccccc' : 'text.secondary',
                  '&:hover': {
                    borderColor: 'error.main',
                    color: 'error.main',
                    backgroundColor: isReply ? 'rgba(255, 255, 255, 0.1)' : 'error.light'
                  }
                }}
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
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {isSubmitting ? 'Posting...' : (isReply ? 'Reply' : 'Post Comment')}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default CommentForm; 