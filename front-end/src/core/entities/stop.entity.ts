export interface Stop {
  id?: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  sequence: number;
  estimatedMinutesFromStart?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
} 