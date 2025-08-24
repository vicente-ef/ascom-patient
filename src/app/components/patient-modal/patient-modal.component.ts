import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {EMPTY, Subject, throwError } from 'rxjs';
import {catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { Patient, PatientUpdateRequest } from '../../models/patient';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-modal',
  templateUrl: './patient-modal.component.html',
  styleUrls: ['./patient-modal.component.scss']
})
export class PatientModalComponent implements OnInit, OnDestroy {
  @Input()
  patient!: Patient;
  @Input()
  show = false;

  @Output()
  close = new EventEmitter<void>();
  @Output()
  patientUpdated = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  patientForm!: FormGroup;
  isEditing = false;
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.patientForm = this.formBuilder.group({
      familyName: [this.patient.familyName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      givenName: [this.patient.givenName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      sex: [this.patient.sex, [Validators.required]]
    });
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.patientForm.patchValue({
        familyName: this.patient.familyName,
        givenName: this.patient.givenName,
        sex: this.patient.sex
      });
      this.submitError = null;
    }
    this.isEditing = !this.isEditing;
  }

  savePatient(): void {
    if (!this.patientForm.valid) {
      this.markFormGroupTouched();
      return;
    }
    this.isSubmitting = true;
    this.submitError = null;

    const updateRequest: PatientUpdateRequest = {
      id: this.patient.id,
      familyName: this.patientForm.value.familyName,
      givenName: this.patientForm.value.givenName,
      sex: this.patientForm.value.sex
    };

      this.patientService.updatePatient(updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        tap(result => {
          this.isEditing = false;
          this.patientUpdated.emit();
        }),
        catchError(error => {
          this.submitError = error.message || 'Failed to update patient';
          return EMPTY;
        }),
        finalize(() => this.isSubmitting = false)

      )
      .subscribe();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      const control = this.patientForm.get(key);
      control?.markAsTouched();
    });
  }

  closeModal(): void {
    if (!this.isSubmitting) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatBirthDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.patientForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at most ${control.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      familyName: 'Family Name',
      givenName: 'Given Name',
      sex: 'Sex'
    };
    return displayNames[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.patientForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  trackByParameterId(_: number, parameter: any): number {
    return parameter.id;
  }
}
