import {Patient} from './patient';
import {SortDirection} from './sort-direction';

export interface SortConfig {
  field: keyof Patient;
  direction: SortDirection;
}
