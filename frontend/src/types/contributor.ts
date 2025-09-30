export interface Contributor {
  name: string;
  role: string;
  description: string;
  avatar: string;
  skills: string[];
  social: {
    github?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    email?: string;
  };
  contribution: string;
  location?: string;
}
