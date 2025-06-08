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
      <Paper 
        elevation={depth === 0 ? 2 : 1} 
        sx={{ 
          p: 2, 
          ml: depth * 3,
          backgroundColor: depth === 0 ? 'background.paper' : 'grey.50',
          border: depth > 0 ? '1px solid #e0e0e0' : 'none'
        }}
      >
        {/* Comment Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
            {comment.user.name ? getInitials(comment.user.name) : <PersonIcon />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {comment.user.name || comment.user.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate((comment as any).createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Comment Content */}
        <Typography variant="body2" sx={{ mb: 2, pl: 5 }}>
          {comment.content}
        </Typography>

        {/* Comment Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 5 }}>
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => setShowReplyForm(!showReplyForm)}
            sx={{ textTransform: 'none' }}
          >
            Reply
          </Button>

          {comment.hasReplies() && (
            <Button
              size="small"
              startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowReplies(!showReplies)}
              sx={{ textTransform: 'none' }}
            >
              {showReplies ? 'Hide' : 'Show'} {comment.getReplies().length} 
              {comment.getReplies().length === 1 ? ' reply' : ' replies'}
            </Button>
          )}
        </Box>

        {/* Reply Form */}
        <Collapse in={showReplyForm}>
          <Box sx={{ mt: 2, pl: 5 }}>
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
          <Box sx={{ mt: 2 }}>
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
      </Paper>
    </Box>
  );
};

export default CommentItem; 