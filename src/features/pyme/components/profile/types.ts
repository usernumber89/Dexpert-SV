export type PymeProfile = {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  industry: string | null;
  logo_url: string | null;
  founded_year: string | null;
  employee_count: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  totalApplications: number;
};

export type PymeSettings = {
  notify_new_applicants: boolean;
  notify_project_updates: boolean;
  notify_weekly_summary: boolean;
};

export type TeamMember = {
  id: string;
  pyme_id: string;
  email: string;
  name: string | null;
  role: string;
  invited_by: string;
  status: string;
  created_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  plan: string;
  plan_name: string;
  amount: number;
  status: string;
  created_at: string;
};

export const defaultSettings: PymeSettings = {
  notify_new_applicants: true,
  notify_project_updates: true,
  notify_weekly_summary: false,
};
