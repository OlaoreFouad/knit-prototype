export interface Knit {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  friendCountRange: '2-4' | '4-7' | '8+';
  securityQuestion?: string;
  securityAnswer?: string;
}


