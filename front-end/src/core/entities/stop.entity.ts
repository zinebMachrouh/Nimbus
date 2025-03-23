export interface Stop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
} 