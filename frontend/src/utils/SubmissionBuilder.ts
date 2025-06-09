/**
 * TypeScript SubmissionBuilder - Frontend Implementation
 * Mirrors the backend Builder pattern for consistent submission creation
 */

export interface SubmissionData {
  title?: string;
  description?: string;
  projectUrl?: string;
  file?: File;
  hackathonId?: number;
  userId?: number;
  isDraft?: boolean;
  isTeamSubmission?: boolean;
}

export class SubmissionBuilder {
  private data: SubmissionData = {
    isDraft: false,
    isTeamSubmission: true
  };

  // Core submission fields
  title(title: string): SubmissionBuilder {
    this.data.title = title?.trim();
    return this;
  }

  description(description: string): SubmissionBuilder {
    this.data.description = description?.trim();
    return this;
  }

  projectUrl(url: string): SubmissionBuilder {
    this.data.projectUrl = url?.trim();
    return this;
  }

  file(file: File): SubmissionBuilder {
    this.data.file = file;
    return this;
  }

  // Context fields
  forHackathon(hackathonId: number): SubmissionBuilder {
    this.data.hackathonId = hackathonId;
    return this;
  }

  byUser(userId: number): SubmissionBuilder {
    this.data.userId = userId;
    return this;
  }

  // Submission type methods
  asDraft(): SubmissionBuilder {
    this.data.isDraft = true;
    return this;
  }

  asFinalSubmission(): SubmissionBuilder {
    this.data.isDraft = false;
    return this;
  }

  asTeamSubmission(): SubmissionBuilder {
    this.data.isTeamSubmission = true;
    return this;
  }

  asIndividualSubmission(): SubmissionBuilder {
    this.data.isTeamSubmission = false;
    return this;
  }

  // Validation methods
  private validateRequired(): string[] {
    const errors: string[] = [];
    
    if (!this.data.hackathonId) {
      errors.push('Hackathon ID is required');
    }
    
    if (!this.data.userId) {
      errors.push('User ID is required');
    }

    return errors;
  }

  private validateFinalSubmission(): string[] {
    const errors = this.validateRequired();

    if (!this.data.title || this.data.title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!this.data.description || this.data.description.length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (this.data.projectUrl && !this.isValidUrl(this.data.projectUrl)) {
      errors.push('Project URL must be a valid URL');
    }

    if (!this.data.file) {
      errors.push('File is required for final submission');
    } else if (this.data.file.size > 50 * 1024 * 1024) {
      errors.push('File size must be less than 50MB');
    }

    return errors;
  }

  private validateDraft(): string[] {
    const errors = this.validateRequired();

    // More lenient validation for drafts
    if (this.data.title && this.data.title.length > 0 && this.data.title.length < 3) {
      errors.push('Title must be at least 3 characters if provided');
    }

    if (this.data.description && this.data.description.length > 0 && this.data.description.length < 10) {
      errors.push('Description must be at least 10 characters if provided');
    }

    if (this.data.projectUrl && !this.isValidUrl(this.data.projectUrl)) {
      errors.push('Project URL must be a valid URL if provided');
    }

    if (this.data.file && this.data.file.size > 50 * 1024 * 1024) {
      errors.push('File size must be less than 50MB');
    }

    return errors;
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Build methods
  validate(): { isValid: boolean; errors: string[] } {
    const errors = this.data.isDraft 
      ? this.validateDraft() 
      : this.validateFinalSubmission();
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  build(): FormData {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return this.toFormData();
  }

  buildDraft(): FormData {
    // More lenient build for drafts
    const errors = this.validateRequired();
    if (errors.length > 0) {
      throw new Error(`Required fields missing: ${errors.join(', ')}`);
    }

    return this.toFormData();
  }

  private toFormData(): FormData {
    const formData = new FormData();

    if (this.data.hackathonId) {
      formData.append('hackathonId', this.data.hackathonId.toString());
    }

    if (this.data.userId) {
      formData.append('userId', this.data.userId.toString());
    }

    if (this.data.title) {
      formData.append('title', this.data.title);
    }

    if (this.data.description) {
      formData.append('description', this.data.description);
    }

    if (this.data.projectUrl) {
      formData.append('projectUrl', this.data.projectUrl);
    }

    if (this.data.file) {
      formData.append('file', this.data.file);
    }

    return formData;
  }

  // Utility methods
  getData(): SubmissionData {
    return { ...this.data };
  }

  reset(): SubmissionBuilder {
    this.data = {
      isDraft: false,
      isTeamSubmission: true
    };
    return this;
  }

  clone(): SubmissionBuilder {
    const newBuilder = new SubmissionBuilder();
    newBuilder.data = { ...this.data };
    return newBuilder;
  }

  // Progressive building support
  hasMinimumData(): boolean {
    return !!(this.data.title || this.data.description || this.data.projectUrl || this.data.file);
  }

  getCompletionPercentage(): number {
    const fields = ['title', 'description', 'projectUrl', 'file'];
    const completed = fields.filter(field => this.data[field as keyof SubmissionData]).length;
    return Math.round((completed / fields.length) * 100);
  }
}

// Factory functions for common use cases
export const createSubmissionBuilder = () => new SubmissionBuilder();

export const createDraftSubmissionBuilder = () => new SubmissionBuilder().asDraft();

export const createTeamSubmissionBuilder = () => new SubmissionBuilder().asTeamSubmission();

export const createIndividualSubmissionBuilder = () => new SubmissionBuilder().asIndividualSubmission(); 