import {
  AbstractControl,
  NG_VALIDATORS,
  PatternValidator,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import {Directive, Input} from '@angular/core';

/**
 * Validates if an element's property may be used for a mapping of the specified type
 */
export function elementPropertyValidator(available: string[]): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    return !available.includes(control.value) ? {stylePropertyName: {value: control.value}} : null;
  };
}

@Directive({
  selector: '[appElementPropertyValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: PatternValidator, multi: true}]
})

export class ElementPropertyValidatorDirective implements Validator {

  @Input() available: string[];

  validate(control: AbstractControl): ValidationErrors | null {
    return this.available ? elementPropertyValidator(this.available) : null;
  }
}


