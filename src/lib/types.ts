export type CVSection = 'skills' | 'experience' | 'education';

export type LinkedInQuestion = {
  id: string;
  question: string;
  answer: string;
  category: 'personal' | 'veteran' | 'visa' | 'linkedin';
};

export type Candidate = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  profilePic?: string;
  summary: string;
  sectionOrder: CVSection[];
  skills: string[];
  education: Array<{ school: string; degree: string; period: string }>;
  experience: Array<{
    company: string;
    role: string;
    period: string;
    details: string[];
  }>;
  culturalFitRating: number;
  linkedinQuestions: LinkedInQuestion[];
};

// Internal recruiter tool types
export type AnonymousCandidate = {
  id: string; // Unique internal ID
  title: string; // Job title only
  summary: string; // Professional summary
  sectionOrder: CVSection[];
  skills: string[];
  education: Array<{ school: string; degree: string; period: string }>;
  experience: Array<{
    company: string;
    role: string;
    period: string;
    details: string[];
  }>;
  culturalFitRating: number;
  linkedinQuestions: LinkedInQuestion[];
  // No personal information (name, email, phone, location, website, profilePic)
};

export type LetterHead = {
  id: string;
  companyName: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  logo?: string;
};

export type ProcessedCVData = {
  id: string;
  originalFileName: string;
  originalContent: string;
  extractedData: Candidate;
  personalInfoRemoved: string;
  createdAt: Date;
};

export type InternalCVData = {
  id: string;
  candidateId: string; // Internal reference ID
  originalFileName: string;
  anonymousData: AnonymousCandidate;
  createdAt: Date;
  updatedAt: Date;
};

