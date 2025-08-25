import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Patient, PatientUpdateRequest} from '../models/patient';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, finalize, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private baseUrl = 'https://mobile.digistat.it/CandidateApi';
  private username = 'test';
  private password = 'TestMePlease!';

  private httpOptions = {
    headers: new HttpHeaders({
      Authorization: 'Basic ' + btoa(this.username + ':' + this.password),
      'Content-Type': 'application/json',
    }),
  };

  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  getPatients(): Observable<Patient[]> {
    this.clearError();
    this.loadingSubject.next(true);

    return this.http.get<Patient[]>(`${this.baseUrl}/Patient/GetList`, this.httpOptions)
      .pipe(
        tap(patients => {
          this.patientsSubject.next(patients);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  updatePatient(patient: PatientUpdateRequest): Observable<any> {
    this.clearError();
    this.loadingSubject.next(true);

    return this.http.post(`${this.baseUrl}/Patient/Update`, patient, this.httpOptions)
      .pipe(
        tap(() => {
          this.refreshPatients();
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  refreshPatients(): void {
    this.getPatients()
      .pipe(take(1))
      .subscribe();
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please check your credentials.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
