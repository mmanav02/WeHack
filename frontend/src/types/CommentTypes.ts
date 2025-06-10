// Composite Pattern Implementation for Comments
// Mirrors the backend CommentComponent interface

export interface CommentComponent {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  getReplies(): CommentComponent[];
  addReply(reply: CommentComponent): void;
  hasReplies(): boolean;
}

export interface Comment extends CommentComponent {
  hackathon: {
    id: number;
    title: string;
  };
  parent?: Comment;
  replies: Comment[];
  createdAt?: string;
}

export interface CommentFormData {
  hackathonId: number;
  userId: number;
  content: string;
  parentId?: number;
}

export class CommentImpl implements Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  hackathon: {
    id: number;
    title: string;
  };
  parent?: Comment;
  replies: Comment[];
  createdAt?: string;

  constructor(data: any) {
    this.id = data.id;
    this.content = data.content;
    this.user = data.user;
    this.hackathon = data.hackathon;
    this.parent = data.parent;
    // Initialize replies as empty array first
    this.replies = [];
    // Then process nested replies if they exist
    if (Array.isArray(data.replies)) {
      this.replies = data.replies.map((reply: any) => new CommentImpl(reply));
    }
    this.createdAt = data.createdAt;
  }

  getReplies(): CommentComponent[] {
    return this.replies || [];
  }

  addReply(reply: CommentComponent): void {
    if (reply instanceof CommentImpl) {
      reply.parent = this;
      if (!this.replies) {
        this.replies = [];
      }
      this.replies.push(reply);
    }
  }

  hasReplies(): boolean {
    return Array.isArray(this.replies) && this.replies.length > 0;
  }
} 