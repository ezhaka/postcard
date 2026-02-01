export interface Company {
  id: string;
  name: string;
  website: string;
  category: string;
}

export interface Release {
  id: string;
  date: string;
  displayName: string;
  companyIds: string[];
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