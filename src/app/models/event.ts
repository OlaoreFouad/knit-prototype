export interface KnitEvent {
  id: string;
  knitId: string;
  title: string;
  description?: string;
  dateIso: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string; // HH:mm
  location?: string;
  imageUrl?: string;
  hostName?: string;
  createdAt: number;
}


