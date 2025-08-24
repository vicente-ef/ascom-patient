import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable, combineLatest, BehaviorSubject, Subject} from 'rxjs';
import {map, takeUntil, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Patient} from '../../models/patient';
import {PatientService} from '../../services/patient.service';
import {FilterConfig} from '../../models/filter-config';
import {SortConfig} from '../../models/sort-config ';
import {SortDirection} from '../../models/sort-direction';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import negate from 'lodash/negate';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  patients$: Observable<Patient[]>;
  loading$ = this.patientService.loading$;
  error$ = this.patientService.error$;

  private filterSubject = new BehaviorSubject<FilterConfig>({});
  private sortSubject = new BehaviorSubject<SortConfig>({field: 'familyName', direction: SortDirection.ASC});
  private paginationSubject = new BehaviorSubject<void>(undefined);

  selectedPatient: Patient | null = null;
  showPatientModal = false;
  currentPage = 1;
  itemsPerPage = 4;
  totalItems = 0;

  filterForm = {
    familyName: '',
    givenName: '',
    sex: '',
    hasAlarm: null as boolean | null
  };

  constructor(private patientService: PatientService) {
    this.patients$ = combineLatest([
      this.patientService.patients$,
      this.filterSubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.sortSubject,
      this.paginationSubject
    ]).pipe(
      map(([patients, filters, sort]) => {
        let filteredPatients = this.applyFilters(patients, filters);
        filteredPatients = this.applySorting(filteredPatients, sort);
        this.totalItems = filteredPatients.length;
        return this.applyPagination(filteredPatients);
      })
    );
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPatients(): void {
    this.patientService.getPatients()
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe();
  }

  private applyFilters(patients: Patient[], filters: FilterConfig): Patient[] {
    return patients.filter(patient => {
      if (filters.familyName && !patient.familyName.toLowerCase().includes(filters.familyName.toLowerCase())) {
        return false;
      }
      if (filters.givenName && !patient.givenName.toLowerCase().includes(filters.givenName.toLowerCase())) {
        return false;
      }
      if (filters.sex && patient.sex !== filters.sex) {
        return false;
      }
      if (!isNil(filters.hasAlarm)) {
        const hasAlarmParam = patient.parameters.some(param => param.alarm);
        if (filters.hasAlarm !== hasAlarmParam) {
          return false;
        }
      }
      return true;
    });
  }

  private applySorting(patients: Patient[], sort: SortConfig): Patient[] {
    return [...patients].sort((a, b) => {
      let valueA: any = a[sort.field];
      let valueB: any = b[sort.field];

      if (sort.field === 'birthDate') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      let comparison = 0;
      if (valueA > valueB) {
        comparison = 1;
      }
      if (valueA < valueB) {
        comparison = -1;
      }

      return sort.direction === SortDirection.DESC ? -comparison : comparison;
    });
  }

  private applyPagination(patients: Patient[]): Patient[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return patients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSort(field: keyof Patient): void {
    const currentSort = this.sortSubject.value;
    const direction = currentSort.field === field && currentSort.direction === SortDirection.ASC
      ? SortDirection.DESC
      : SortDirection.ASC;

    this.sortSubject.next({field, direction});
  }

  getSortIcon(field: keyof Patient): string {
    const currentSort = this.sortSubject.value;
    if (currentSort.field !== field) {
      return 'bi-arrow-down-up';
    }
    return currentSort.direction === SortDirection.ASC ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  onFilterChange(): void {
    const filters: FilterConfig = {
      familyName: this.filterForm.familyName || undefined,
      givenName: this.filterForm.givenName || undefined,
      sex: this.filterForm.sex ?? undefined,
      hasAlarm: this.filterForm.hasAlarm ?? undefined
    };

    this.filterSubject.next(filters);
    this.currentPage = 1;
  }

  isFiltersApplied(): boolean {
    const {familyName, givenName, sex, hasAlarm} = this.filterForm;
    return [familyName, givenName, sex].some(negate(isEmpty)) || !isNil(hasAlarm);
  }

  clearFilters(): void {
    this.filterForm = {
      familyName: '',
      givenName: '',
      sex: '',
      hasAlarm: null
    };
    this.filterSubject.next({});
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.paginationSubject.next();
  }

  openPatientDetail(patient: Patient): void {
    this.selectedPatient = patient;
    this.showPatientModal = true;
  }

  closePatientModal(): void {
    this.showPatientModal = false;
    this.selectedPatient = null;
  }

  onPatientUpdated(): void {
    this.closePatientModal();
    this.loadPatients();
  }

  formatBirthDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  hasAlarmParameters(patient: Patient): boolean {
    return patient.parameters.some(param => param.alarm);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  trackByPatientId(_: number, patient: Patient): number {
    return patient.id;
  }
}
