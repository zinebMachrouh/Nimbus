import { BaseEntity } from './base.entity';
import { Route } from './route.entity';
import { Student } from './student.entity';

export interface School extends BaseEntity {
  name: string;
  address: string;
  phoneNumber: string;
  latitude?: number;
  longitude?: number;
  students?: Student[];
  routes?: Route[];
  activeStudentsCount?: number;
  activeRoutesCount?: number;
  activeDriversCount?: number;
  activeVehiclesCount?: number;
} 