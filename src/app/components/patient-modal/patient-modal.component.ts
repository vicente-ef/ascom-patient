import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {EMPTY, Subject } from 'rxjs';
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
    private patientService: PatientService,
    private translate: TranslateService
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
      const fieldDisplayName = this.getFieldDisplayName(fieldName);

      if (control.errors['required']) {
        return this.translate.instant('validation.required', { field: fieldDisplayName });
      }
      if (control.errors['minlength']) {
        return this.translate.instant('validation.minlength', {
          field: fieldDisplayName,
          requiredLength: control.errors['minlength'].requiredLength
        });
      }
      if (control.errors['maxlength']) {
        return this.translate.instant('validation.maxlength', {
          field: fieldDisplayName,
          requiredLength: control.errors['maxlength'].requiredLength
        });
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    return this.translate.instant(`validation.${fieldName}`);
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.patientForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  trackByParameterId(_: number, parameter: any): number {
    return parameter.id;
  }
}
