import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PatientGridComponent } from './components/patient-grid/patient-grid.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpClientModule ],
  declarations: [ AppComponent, PatientGridComponent, PatientDetailComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
