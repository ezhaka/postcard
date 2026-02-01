export interface Company {
  id: string;
  name: string;
  website: string;
  category: string;
  source: 'official' | 'community';
  verified?: boolean;
  submittedAt?: string;
  verifiedAt?: string;
  evidenceLink?: string;
}

export interface Release {
  id: string;
  date: string;
  displayName: string;
  companyIds: string[];
}

export interface CommunityMetadata {
  lastUpdated: string;
}

export interface SubmissionRequest {
  id: string;
  type: 'addition' | 'correction';
  companyName: string;
  website: string;
  category: string;
  details: string;
  submittedAt: string;
}