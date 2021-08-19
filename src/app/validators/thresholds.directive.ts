import {
  AbstractControl,
  FormArray,
  NG_VALIDATORS,
  PatternValidator,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import {Directive} from '@angular/core';

/**
 * Validates if a continuous mapping only contains unique thresholds
 */
export function uniqueThresholdsValidator(): ValidatorFn {
  return (control: FormArray): ValidationErrors | null => {

    const uniques: number[] = [];

    for (const item of control.controls) {
      if (!uniques.includes(item.get('threshold').value)) {
        uniques.push(item.get('threshold').value);
      } else {
        item.markAsTouched();
        return {duplicateThreshold: {value: item.get('threshold').value}};
      }
    }
    return null;
  };
}


@Directive({
  selector: '[appThresholdsValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: PatternValidator, multi: true}]
})

export class ThresholdsValidatorDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    return uniqueThresholdsValidator();
  }
}
