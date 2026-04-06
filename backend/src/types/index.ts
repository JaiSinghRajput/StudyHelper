// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Omit<User, 'password'>;
}

// Study Material Request/Response Types
export interface StudyMaterialRequest {
  question: string;
  topic?: string;
  includeResearch?: boolean;
  includeDiagrams?: boolean;
}

export interface StreamChunk {
  type: 'planning' | 'researching' | 'generating' | 'complete' | 'error';
  data: any;
  progress?: number;
  timestamp: Date;
}

export interface StudyMaterialResponse {
  id: string;
  question: string;
  content: string;
  summary: string;
  diagrams?: string[];
  createdAt: Date;
  processedAt: Date;
}

// Request with User Context
export interface AuthenticatedRequest {
  userId: string;
  username: string;
  email: string;
  role: string;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: Date;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: Date;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
