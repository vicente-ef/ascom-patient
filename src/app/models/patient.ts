import { Parameter } from './parameter';

export interface Patient {
  id: number;
  familyName: string;
  givenName: string;
  birthDate: string;
  sex: string;
  parameters: Parameter[];
}


export interface PatientUpdateRequest {
  id: number;
  familyName: string;
  givenName: string;
  sex: string;
}
