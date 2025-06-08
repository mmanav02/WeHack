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
    this.replies = data.replies || [];
    this.createdAt = data.createdAt;
  }

  getReplies(): CommentComponent[] {
    return this.replies;
  }

  addReply(reply: CommentComponent): void {
    if (reply instanceof CommentImpl) {
      reply.parent = this;
      this.replies.push(reply);
    }
  }

  hasReplies(): boolean {
    return this.replies.length > 0;
  }
} 