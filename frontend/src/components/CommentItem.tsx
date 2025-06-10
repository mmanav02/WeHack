import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Divider,
  Collapse
} from '@mui/material';
import {
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { CommentComponent } from '../types/CommentTypes';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: CommentComponent;
  onReply: (parentId: number, content: string) => void;
  hackathonId: number;
  currentUserId: number;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  hackathonId, 
  currentUserId, 
  depth = 0 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = (content: string) => {
    onReply(comment.id, content);
    setShowReplyForm(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{ 
          p: 2, 
          ml: depth * 3,
          backgroundColor: '#424242',
          borderRadius: 2,
          color: '#ffffff'
        }}
      >
        {/* Comment Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 36, height: 36, mr: 2, bgcolor: 'primary.main' }}>
            {comment.user.name ? getInitials(comment.user.name) : <PersonIcon />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
              {comment.user.name || comment.user.email}
            </Typography>
            <Typography variant="caption" color="#cccccc">
              {formatDate((comment as any).createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Comment Content */}
        <Typography variant="body2" sx={{ mb: 2, pl: 6, color: '#ffffff', lineHeight: 1.6 }}>
          {comment.content}
        </Typography>

        {/* Comment Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 6 }}>
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => setShowReplyForm(!showReplyForm)}
            sx={{ 
              textTransform: 'none',
              color: '#cccccc',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'primary.main'
              }
            }}
          >
            Reply
          </Button>

          {comment.hasReplies() && (
            <Button
              size="small"
              startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowReplies(!showReplies)}
              sx={{ 
                textTransform: 'none',
                color: '#cccccc',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'primary.main'
                }
              }}
            >
              {showReplies ? 'Hide' : 'Show'} {comment.getReplies().length} 
              {comment.getReplies().length === 1 ? ' reply' : ' replies'}
            </Button>
          )}
        </Box>

        {/* Reply Form */}
        <Collapse in={showReplyForm}>
          <Box sx={{ mt: 3, pl: 6 }}>
            <CommentForm
              hackathonId={hackathonId}
              userId={currentUserId}
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.user.name || comment.user.email}...`}
              isReply={true}
            />
          </Box>
        </Collapse>

        {/* Nested Replies - Composite Pattern: Comment contains other Comments */}
        <Collapse in={showReplies}>
          <Box sx={{ mt: 3 }}>
            {comment.getReplies().map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                hackathonId={hackathonId}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CommentItem; 