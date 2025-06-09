/**
 * RoleFactory - Frontend Implementation
 * Mirrors the backend HackathonRoleFactory for consistent role creation
 */

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Hackathon {
  id: number;
  title: string;
  status: string;
}

export enum Role {
  PARTICIPANT = 'PARTICIPANT',
  JUDGE = 'JUDGE',
  ORGANIZER = 'ORGANIZER'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface HackathonRole {
  user: User;
  hackathon: Hackathon;
  role: Role;
  status: ApprovalStatus;
  createdAt: Date;
  metadata?: {
    autoApproved: boolean;
    requiresReview: boolean;
    canEdit: boolean;
  };
}

export interface RoleCreationRequest {
  user: User;
  hackathon: Hackathon;
  role: Role;
  requestedAt?: Date;
}

export class RoleFactory {
  /**
   * Creates a HackathonRole with appropriate status based on role type
   * Mirrors backend HackathonRoleFactory.create() logic
   */
  static create(request: RoleCreationRequest): HackathonRole {
    const { user, hackathon, role, requestedAt = new Date() } = request;

    // Centralized approval logic - mirrors backend logic
    let status: ApprovalStatus;
    let autoApproved = false;
    let requiresReview = false;
    let canEdit = true;

    switch (role) {
      case Role.PARTICIPANT:
        status = ApprovalStatus.APPROVED;
        autoApproved = true;
        requiresReview = false;
        break;
        
      case Role.JUDGE:
        status = ApprovalStatus.PENDING;
        autoApproved = false;
        requiresReview = true;
        canEdit = false; // Can't edit until approved
        break;
        
      case Role.ORGANIZER:
        status = ApprovalStatus.APPROVED;
        autoApproved = true;
        requiresReview = false;
        break;
        
      default:
        status = ApprovalStatus.APPROVED;
        autoApproved = true;
        requiresReview = false;
    }

    // Additional business rules based on hackathon status
    if (hackathon.status === 'Completed') {
      canEdit = false;
    }

    return {
      user,
      hackathon,
      role,
      status,
      createdAt: requestedAt,
      metadata: {
        autoApproved,
        requiresReview,
        canEdit
      }
    };
  }

  /**
   * Creates a participant role request
   */
  static createParticipantRequest(user: User, hackathon: Hackathon): HackathonRole {
    return this.create({
      user,
      hackathon,
      role: Role.PARTICIPANT
    });
  }

  /**
   * Creates a judge role request
   */
  static createJudgeRequest(user: User, hackathon: Hackathon): HackathonRole {
    return this.create({
      user,
      hackathon,
      role: Role.JUDGE
    });
  }

  /**
   * Creates an organizer role
   */
  static createOrganizerRole(user: User, hackathon: Hackathon): HackathonRole {
    return this.create({
      user,
      hackathon,
      role: Role.ORGANIZER
    });
  }

  /**
   * Validates if a role request is valid
   */
  static validateRoleRequest(request: RoleCreationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.user || !request.user.id) {
      errors.push('Valid user is required');
    }

    if (!request.hackathon || !request.hackathon.id) {
      errors.push('Valid hackathon is required');
    }

    if (!Object.values(Role).includes(request.role)) {
      errors.push('Valid role is required');
    }

    // Business rule validations
    if (request.hackathon?.status === 'Completed' && request.role !== Role.ORGANIZER) {
      errors.push('Cannot join completed hackathon');
    }

    if (request.hackathon?.status === 'Draft' && request.role !== Role.ORGANIZER) {
      errors.push('Cannot join unpublished hackathon');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets the display color for a role
   */
  static getRoleColor(role: Role): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' {
    switch (role) {
      case Role.PARTICIPANT:
        return 'primary';
      case Role.JUDGE:
        return 'secondary';
      case Role.ORGANIZER:
        return 'success';
      default:
        return 'info';
    }
  }

  /**
   * Gets the display color for approval status
   */
  static getStatusColor(status: ApprovalStatus): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'success';
      case ApprovalStatus.PENDING:
        return 'warning';
      case ApprovalStatus.REJECTED:
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Converts backend API response to HackathonRole
   */
  static fromApiResponse(apiData: any): HackathonRole {
    return this.create({
      user: {
        id: apiData.user?.id || apiData.userId,
        username: apiData.user?.username || apiData.username || `User ${apiData.userId}`,
        email: apiData.user?.email || apiData.email || `user${apiData.userId}@example.com`
      },
      hackathon: {
        id: apiData.hackathon?.id || apiData.hackathonId,
        title: apiData.hackathon?.title || apiData.hackathonName || `Hackathon ${apiData.hackathonId}`,
        status: apiData.hackathon?.status || 'Published'
      },
      role: apiData.role as Role,
      requestedAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date()
    });
  }
}

// Factory functions for common use cases
export const createParticipantRole = (user: User, hackathon: Hackathon) => 
  RoleFactory.createParticipantRequest(user, hackathon);

export const createJudgeRole = (user: User, hackathon: Hackathon) => 
  RoleFactory.createJudgeRequest(user, hackathon);

export const createOrganizerRole = (user: User, hackathon: Hackathon) => 
  RoleFactory.createOrganizerRole(user, hackathon); 