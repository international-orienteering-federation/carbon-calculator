import { StepperSelectionEvent, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    }],
})
export class AppComponent implements OnInit {
  title = 'carbon-calculator';
  factors: string = "";


  @ViewChild(MatAccordion) accordion: MatAccordion | undefined;

  constructor(
    private _formBuilder: FormBuilder,
    private httpclient: HttpClient) { }
  ngOnInit(): void {

    this.httpclient.get('assets/factors.csv', { responseType: 'text' })
      .subscribe(
        data => {
          this.factors = data;
        }
      );

  }
  kmFormGroup: FormGroup = this._formBuilder.group({
    km: [undefined, [
      Validators.required,
      Validators.pattern("^[0-9]*$"),
      Validators.min(0),
    ]]
  });
  engineFormGroup: FormGroup = this._formBuilder.group({ engine: ['', Validators.required] });
  carFormGroup: FormGroup = this._formBuilder.group({ car: ['', Validators.required] });
  peopleFormGroup: FormGroup = this._formBuilder.group({
    people: [undefined, [
      Validators.required,
      Validators.pattern("^[0-9]*$"),
      Validators.min(0),
    ]]
  });


  tripFootprint: number = 0;
  perCapitaFootprint: number = 0;

  onStepChange(e: StepperSelectionEvent) {
    if (e.selectedIndex == 5)
      this.calculateFootprint();
  }

  onCarSelected(e: MatRadioChange) {
    this.accordion?.closeAll();
  }

  calculateFootprint() {
    let car = this.carFormGroup.controls['car'].value;
    let engine = this.engineFormGroup.controls['engine'].value;


    let km = this.kmFormGroup.controls['km'].value;
    let people = this.peopleFormGroup.controls['people'].value;

    let factor = 0;

    for (let line of this.factors.split("\n")) {
      if (!line.startsWith(`${car},${engine},`))
        continue;

      factor = parseFloat(line.split(',')[2]);
    }

    this.tripFootprint = km * factor;
    this.perCapitaFootprint = this.tripFootprint / people;

  }

}
