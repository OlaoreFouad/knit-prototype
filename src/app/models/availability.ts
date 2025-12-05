export interface Availability {
  knitId: string;
  owner: 'self';
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  selectedDateKeys: string[]; // 'YYYY-MM-DD'
  selectedTimeSlots: string[]; // 'HH:mm'
  perDateTime?: Record<string, Record<string, 'yes' | 'maybe' | 'no'>>; // dateKey -> time -> status
}


