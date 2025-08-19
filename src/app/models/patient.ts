import { Parameter } from './parameter';

export interface Patient {
  id: number;
  familyName: string;
  givenName: string;
  birthDate: string;
  sex: string;
  parameters: Parameter[];
}
