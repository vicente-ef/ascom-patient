import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent {
  @Input() patient!: Patient;
  @Output() close = new EventEmitter<boolean>();
  saving = false;

  constructor(private patientService: PatientService) {}

  save() {
    this.saving = true;
    this.patientService.updatePatient(this.patient).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit(true);
      },
      error: () => {
        this.saving = false;
        alert('Failed to update patient');
      }
    });
  }

  dismiss() {
    this.close.emit(false);
  }
}
