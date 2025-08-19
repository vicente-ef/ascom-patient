import { Component, OnInit } from '@angular/core';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-grid',
  templateUrl: './patient-grid.component.html',
  styleUrls: ['./patient-grid.component.css']
})
export class PatientGridComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filterText: string = '';
  selectedPatient: Patient | null = null;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(data => {
      this.patients = data;
      this.filteredPatients = data;
    });
  }

  filter(): void {
    const term = this.filterText.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.familyName.toLowerCase().includes(term) ||
      p.givenName.toLowerCase().includes(term) ||
      p.sex.toLowerCase().includes(term)
    );
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredPatients = [...this.filteredPatients].sort((a, b) => {
      let valA = (a as any)[column];
      let valB = (b as any)[column];
      if (column === 'birthDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  hasAlarm(patient: Patient): boolean {
    return patient.parameters?.some(p => p.alarm) ?? false;
  }

  openDetail(patient: Patient) {
    this.selectedPatient = { ...patient };
  }

  onDialogClose(updated: boolean) {
    this.selectedPatient = null;
    if (updated) {
      this.loadPatients();
    }
  }
}
