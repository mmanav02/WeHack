import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Collapse
} from '@mui/material';
import {
  Comment as CommentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { commentAPI } from '../services/api';
import { CommentComponent, CommentImpl, CommentFormData } from '../types/CommentTypes';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  hackathonId: number;
  currentUserId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ hackathonId, currentUserId }) => {
  const [comments, setComments] = useState<CommentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Composite Pattern: Build hierarchical comment tree from flat backend data
  const buildCommentTree = (flatComments: any[]): CommentComponent[] => {
    const commentMap = new Map<number, CommentImpl>();
    const rootComments: CommentImpl[] = [];

    // First pass: Create all comment objects
    flatComments.forEach(commentData => {
      const comment = new CommentImpl(commentData);
      commentMap.set(comment.id, comment);
    });

    // Second pass: Build parent-child relationships (Composite Pattern)
    flatComments.forEach(commentData => {
      const comment = commentMap.get(commentData.id);
      if (comment) {
        if (commentData.parent && commentData.parent.id) {
          // This is a reply - add it to parent's replies
          const parentComment = commentMap.get(commentData.parent.id);
          if (parentComment) {
            parentComment.addReply(comment);
          }
        } else {
          // This is a top-level comment
          rootComments.push(comment);
        }
      }
    });

    return rootComments;
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentAPI.getComments(hackathonId);
      
      // Build hierarchical comment tree using Composite pattern
      const commentTree = buildCommentTree(response.data);
      setComments(commentTree);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [hackathonId]);

  const handleAddComment = async (content: string) => {
    try {
      const commentData = {
        hackathonId,
        userId: currentUserId,
        content,
        // No parentId for top-level comments
      };

      await commentAPI.addComment(commentData);
      
      // Refresh comments to show the new one
      await fetchComments();
      setShowCommentForm(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  };

  const handleAddReply = async (parentId: number, content: string) => {
    try {
      const commentData = {
        hackathonId,
        userId: currentUserId,
        content,
        parentId // This makes it a reply
      };

      await commentAPI.addComment(commentData);
      
      // Refresh comments to show the new reply
      await fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      throw new Error('Failed to add reply');
    }
  };

  const getTotalCommentCount = (commentList: CommentComponent[]): number => {
    return commentList.reduce((total, comment) => {
      return total + 1 + getTotalCommentCount(comment.getReplies());
    }, 0);
  };

  const totalComments = getTotalCommentCount(comments);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading comments...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Comments ({totalComments})
          </Typography>
        </Box>
        
        <Button
          size="small"
          startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ textTransform: 'none' }}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </Box>

      <Collapse in={isExpanded}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button 
              size="small" 
              onClick={fetchComments} 
              sx={{ ml: 2, textTransform: 'none' }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Add Comment Form */}
        <Box sx={{ mb: 3 }}>
          {!showCommentForm ? (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CommentIcon />}
              onClick={() => setShowCommentForm(true)}
              sx={{ textTransform: 'none', py: 1.5 }}
            >
              Add a comment...
            </Button>
          ) : (
            <CommentForm
              hackathonId={hackathonId}
              userId={currentUserId}
              onSubmit={handleAddComment}
              onCancel={() => setShowCommentForm(false)}
              placeholder="Share your thoughts about this hackathon..."
            />
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Comments List - Composite Pattern in Action */}
        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CommentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <Box>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleAddReply}
                hackathonId={hackathonId}
                currentUserId={currentUserId}
                depth={0}
              />
            ))}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default CommentSection; 