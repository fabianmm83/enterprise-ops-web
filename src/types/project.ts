export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface ProjectOwner {
  id: string;
  email: string;
  fullName: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: ProjectOwner;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}