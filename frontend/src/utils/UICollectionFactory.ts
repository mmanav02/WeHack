/**
 * UICollectionFactory - Frontend Implementation
 * Mirrors the backend CollectionFactory for consistent UI collection creation
 */

import { ReactNode } from 'react';

// Base interfaces for collections
export interface UIItem {
  id: number;
  displayName: string;
  metadata?: Record<string, any>;
}

export interface UICollection<T extends UIItem> {
  items: T[];
  count: number;
  createIterator(): UIIterator<T>;
  filter(predicate: (item: T) => boolean): UICollection<T>;
  map<U extends UIItem>(transform: (item: T) => U): UICollection<U>;
  sort(compareFn?: (a: T, b: T) => number): UICollection<T>;
  toArray(): T[];
}

export interface UIIterator<T> {
  hasNext(): boolean;
  next(): T | null;
  reset(): void;
  current(): T | null;
}

// Concrete iterator implementation
class ArrayUIIterator<T extends UIItem> implements UIIterator<T> {
  private position = 0;
  
  constructor(private items: T[]) {}

  hasNext(): boolean {
    return this.position < this.items.length;
  }

  next(): T | null {
    if (this.hasNext()) {
      return this.items[this.position++];
    }
    return null;
  }

  reset(): void {
    this.position = 0;
  }

  current(): T | null {
    return this.items[this.position - 1] || null;
  }
}

// Base collection implementation
abstract class BaseUICollection<T extends UIItem> implements UICollection<T> {
  constructor(public items: T[]) {}

  get count(): number {
    return this.items.length;
  }

  createIterator(): UIIterator<T> {
    return new ArrayUIIterator(this.items);
  }

  filter(predicate: (item: T) => boolean): UICollection<T> {
    const filteredItems = this.items.filter(predicate);
    return this.createCollection(filteredItems);
  }

  map<U extends UIItem>(transform: (item: T) => U): UICollection<U> {
    const transformedItems = this.items.map(transform);
    return new GenericUICollection(transformedItems);
  }

  sort(compareFn?: (a: T, b: T) => number): UICollection<T> {
    const sortedItems = [...this.items].sort(compareFn);
    return this.createCollection(sortedItems);
  }

  toArray(): T[] {
    return [...this.items];
  }

  protected abstract createCollection(items: T[]): UICollection<T>;
}

// Generic collection implementation
class GenericUICollection<T extends UIItem> extends BaseUICollection<T> {
  protected createCollection(items: T[]): UICollection<T> {
    return new GenericUICollection(items);
  }
}

// Specific collection types

// Hackathon Collection
export interface HackathonUIItem extends UIItem {
  id: number;
  displayName: string;
  description: string;
  status: string;
  organizerId?: number;
  startDate?: string;
  endDate?: string;
  participantsCount?: number;
  metadata?: {
    canEdit: boolean;
    canJoin: boolean;
    isOrganizer: boolean;
    statusColor: string;
  };
}

export class HackathonCollection extends BaseUICollection<HackathonUIItem> {
  protected createCollection(items: HackathonUIItem[]): HackathonCollection {
    return new HackathonCollection(items);
  }

  // Hackathon-specific methods
  getByStatus(status: string): HackathonCollection {
    return this.filter(hackathon => hackathon.status === status) as HackathonCollection;
  }

  getActiveHackathons(): HackathonCollection {
    return this.filter(hackathon => 
      hackathon.status === 'Published' || hackathon.status === 'Judging'
    ) as HackathonCollection;
  }

  getUserOrganizedHackathons(userId: number): HackathonCollection {
    return this.filter(hackathon => hackathon.organizerId === userId) as HackathonCollection;
  }
}

// Team Collection
export interface TeamUIItem extends UIItem {
  id: number;
  displayName: string;
  hackathonId: number;
  memberCount: number;
  members: {
    id: number;
    username: string;
    email: string;
    role?: string;
  }[];
  createdAt?: string;
  metadata?: {
    canJoin: boolean;
    isFull: boolean;
    hasCurrentUser: boolean;
    isLeader: boolean;
  };
}

export class TeamCollection extends BaseUICollection<TeamUIItem> {
  protected createCollection(items: TeamUIItem[]): TeamCollection {
    return new TeamCollection(items);
  }

  // Team-specific methods
  getAvailableTeams(): TeamCollection {
    return this.filter(team => team.metadata?.canJoin === true) as TeamCollection;
  }

  getUserTeams(userId: number): TeamCollection {
    return this.filter(team => 
      team.members.some(member => member.id === userId)
    ) as TeamCollection;
  }

  getTeamsBySize(minSize: number, maxSize?: number): TeamCollection {
    return this.filter(team => {
      const size = team.memberCount;
      return size >= minSize && (maxSize ? size <= maxSize : true);
    }) as TeamCollection;
  }
}

// Submission Collection
export interface SubmissionUIItem extends UIItem {
  id: number;
  displayName: string;
  title: string;
  description: string;
  hackathonId?: number;
  hackathonName?: string;
  teamName?: string;
  submittedAt?: string;
  projectUrl?: string;
  filePath?: string;
  isPrimary?: boolean;
  metadata?: {
    canEdit: boolean;
    canView: boolean;
    canJudge: boolean;
    hasFile: boolean;
    hasUrl: boolean;
  };
}

export class SubmissionCollection extends BaseUICollection<SubmissionUIItem> {
  protected createCollection(items: SubmissionUIItem[]): SubmissionCollection {
    return new SubmissionCollection(items);
  }

  // Submission-specific methods
  getPrimarySubmissions(): SubmissionCollection {
    return this.filter(submission => submission.isPrimary === true) as SubmissionCollection;
  }

  getByHackathon(hackathonId: number): SubmissionCollection {
    return this.filter(submission => submission.hackathonId === hackathonId) as SubmissionCollection;
  }

  getUserSubmissions(userId: number): SubmissionCollection {
    return this.filter(submission => 
      submission.metadata?.canEdit === true
    ) as SubmissionCollection;
  }

  getJudgeableSubmissions(): SubmissionCollection {
    return this.filter(submission => 
      submission.metadata?.canJudge === true
    ) as SubmissionCollection;
  }
}

// Participant Collection
export interface ParticipantUIItem extends UIItem {
  id: number;
  displayName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  hackathonId: number;
  joinedAt?: string;
  metadata?: {
    isCurrentUser: boolean;
    canManage: boolean;
    roleColor: string;
    statusColor: string;
  };
}

export class ParticipantCollection extends BaseUICollection<ParticipantUIItem> {
  protected createCollection(items: ParticipantUIItem[]): ParticipantCollection {
    return new ParticipantCollection(items);
  }

  // Participant-specific methods
  getByRole(role: string): ParticipantCollection {
    return this.filter(participant => participant.role === role) as ParticipantCollection;
  }

  getApprovedParticipants(): ParticipantCollection {
    return this.filter(participant => participant.status === 'APPROVED') as ParticipantCollection;
  }

  getPendingApprovals(): ParticipantCollection {
    return this.filter(participant => participant.status === 'PENDING') as ParticipantCollection;
  }

  getJudges(): ParticipantCollection {
    return this.getByRole('JUDGE');
  }

  getParticipants(): ParticipantCollection {
    return this.getByRole('PARTICIPANT');
  }
}

// Main Factory Class
export class UICollectionFactory {
  /**
   * Creates a HackathonCollection from raw hackathon data
   */
  static hackathons(rawData: any[], currentUserId?: number): HackathonCollection {
    const hackathonItems: HackathonUIItem[] = rawData.map(hackathon => {
      // DEBUG: Log each hackathon to understand the data structure
      console.log(`🔍 Processing hackathon ${hackathon.id}: title="${hackathon.title}", status="${hackathon.status}"`);
      
      // Use the original title if it exists and is meaningful, otherwise generate fallback
      let displayName = hackathon.title;
      if (!displayName || displayName.trim() === '' || displayName.match(/^Hackathon \d+$/)) {
        const status = hackathon.status || 'Draft';
        const id = hackathon.id;
        
        console.log(`📝 Generating fallback name for hackathon ${id} with status ${status}`);
        
        switch (status) {
          case 'Published':
            displayName = `Innovation Challenge ${id}`;
            break;
          case 'Judging':
            displayName = `Tech Hackathon ${id} (Judging)`;
            break;
          case 'Completed':
            displayName = `Completed Challenge ${id}`;
            break;
          default: // Draft
            displayName = `Draft Hackathon ${id}`;
            break;
        }
      } else {
        console.log(`✅ Using original title "${displayName}" for hackathon ${hackathon.id}`);
      }

      return {
        id: hackathon.id,
        displayName,
        description: hackathon.description || '',
        status: hackathon.status || 'Draft',
        organizerId: hackathon.organizer?.id || hackathon.organizerId,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        participantsCount: hackathon.participantsCount || 0,
        metadata: {
          canEdit: currentUserId === (hackathon.organizer?.id || hackathon.organizerId),
          canJoin: hackathon.status === 'Published',
          isOrganizer: currentUserId === (hackathon.organizer?.id || hackathon.organizerId),
          statusColor: UICollectionFactory.getStatusColor(hackathon.status)
        }
      };
    });

    return new HackathonCollection(hackathonItems);
  }

  /**
   * Creates a TeamCollection from raw team data
   */
  static teams(rawData: any[], hackathonId?: number, currentUserId?: number): TeamCollection {
    const teamItems: TeamUIItem[] = rawData.map(team => {
      const members = team.members || team.users || [];
      const hasCurrentUser = currentUserId ? members.some((m: any) => m.id === currentUserId) : false;
      
      return {
        id: team.id,
        displayName: team.name || `Team ${team.id}`,
        hackathonId: hackathonId || team.hackathonId,
        memberCount: members.length,
        members: members.map((member: any) => ({
          id: member.id,
          username: member.username || `User ${member.id}`,
          email: member.email || `user${member.id}@example.com`,
          role: member.role
        })),
        createdAt: team.createdAt,
        metadata: {
          canJoin: !hasCurrentUser && members.length < (team.maxSize || 5),
          isFull: members.length >= (team.maxSize || 5),
          hasCurrentUser,
          isLeader: hasCurrentUser && members[0]?.id === currentUserId
        }
      };
    });

    return new TeamCollection(teamItems);
  }

  /**
   * Creates a SubmissionCollection from raw submission data
   */
  static submissions(rawData: any[], currentUserId?: number, userRole?: string): SubmissionCollection {
    const submissionItems: SubmissionUIItem[] = rawData.map(submission => {
      const isOwner = currentUserId === (submission.user?.id || submission.userId);
      const canJudge = userRole === 'JUDGE' && !isOwner;
      
      return {
        id: submission.id,
        displayName: submission.title || `Submission ${submission.id}`,
        title: submission.title || '',
        description: submission.description || '',
        hackathonId: submission.hackathon?.id || submission.hackathonId,
        hackathonName: submission.hackathon?.title || submission.hackathonName,
        teamName: submission.team?.name || submission.teamName,
        submittedAt: submission.submitTime || submission.submittedAt,
        projectUrl: submission.projectUrl,
        filePath: submission.filePath,
        isPrimary: submission.isPrimary || false,
        metadata: {
          canEdit: isOwner,
          canView: true,
          canJudge,
          hasFile: !!submission.filePath,
          hasUrl: !!submission.projectUrl
        }
      };
    });

    return new SubmissionCollection(submissionItems);
  }

  /**
   * Creates a ParticipantCollection from raw participant data
   */
  static participants(rawData: any[], currentUserId?: number, isOrganizer?: boolean): ParticipantCollection {
    const participantItems: ParticipantUIItem[] = rawData.map(participant => ({
      id: participant.user?.id || participant.userId,
      displayName: participant.user?.username || participant.username || `User ${participant.userId}`,
      username: participant.user?.username || participant.username || `User ${participant.userId}`,
      email: participant.user?.email || participant.email || `user${participant.userId}@example.com`,
      role: participant.role || 'PARTICIPANT',
      status: participant.status || 'APPROVED',
      hackathonId: participant.hackathon?.id || participant.hackathonId,
      joinedAt: participant.createdAt || participant.joinedAt,
      metadata: {
        isCurrentUser: currentUserId === (participant.user?.id || participant.userId),
        canManage: isOrganizer || false,
        roleColor: UICollectionFactory.getRoleColor(participant.role),
        statusColor: UICollectionFactory.getApprovalStatusColor(participant.status)
      }
    }));

    return new ParticipantCollection(participantItems);
  }

  // Helper methods for consistent styling
  private static getStatusColor(status: string): string {
    switch (status) {
      case 'Published': return 'success';
      case 'Judging': return 'warning';
      case 'Completed': return 'info';
      case 'Draft': return 'default';
      default: return 'default';
    }
  }

  private static getRoleColor(role: string): string {
    switch (role) {
      case 'PARTICIPANT': return 'primary';
      case 'JUDGE': return 'secondary';
      case 'ORGANIZER': return 'success';
      default: return 'default';
    }
  }

  private static getApprovalStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  }
}

// Factory functions for common use cases
export const createHackathonCollection = (data: any[], currentUserId?: number) => 
  UICollectionFactory.hackathons(data, currentUserId);

export const createTeamCollection = (data: any[], hackathonId?: number, currentUserId?: number) => 
  UICollectionFactory.teams(data, hackathonId, currentUserId);

export const createSubmissionCollection = (data: any[], currentUserId?: number, userRole?: string) => 
  UICollectionFactory.submissions(data, currentUserId, userRole);

export const createParticipantCollection = (data: any[], currentUserId?: number, isOrganizer?: boolean) => 
  UICollectionFactory.participants(data, currentUserId, isOrganizer); 