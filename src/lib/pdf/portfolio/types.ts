export interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
  university: string | null;
  major: string | null;
  location: string | null;
  about_me: string | null;
  bio: string | null;
  is_premium: boolean;
  skills: unknown;
}

export interface PortfolioEntry {
  id: string;
  title: string;
  description: string | null;
  custom_description: string | null;
  tools_used: unknown;
  score?: number | null;
  completed_at: string | null;
  role_description: string | null;
  project_url: string | null;
}

export interface PortfolioData {
  student: Student;
  entries: PortfolioEntry[];
  education: unknown[];
  experience: unknown[];
  certificates: unknown[];
  skills: string[];
  totalEntries: number;
  totalCertificates: number;
}
