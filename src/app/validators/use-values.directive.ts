import {
  AbstractControl,
  FormArray,
  FormGroup,
  NG_VALIDATORS,
  PatternValidator,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import {Directive, Input} from '@angular/core';
import {MappingType, UtilityService} from '../services/utility.service';

/**
 * Validates if a continuous mapping collection contains two assigned values for each mapping
 */
export function useValuesContinuousValidator(): ValidatorFn {
  return (control: FormArray): ValidationErrors | null => {

    let foundError = false;
    const mappingsLength = (control.controls[0]?.get('equals') as FormArray)?.length;
    const errorList = [];

    mappingLoop: for (let i = 0; i < mappingsLength; i++) {
      let foundVisibleCount = 0;

      for (const threshold of control.controls) {
        // each visible value for this mapping is counted
        if ((threshold.get('useValues') as FormArray).controls[i]?.value) {
          foundVisibleCount++;
        }
        // when two or more are visible, check next mapping
        if (foundVisibleCount > 1) {
          continue mappingLoop;
        }
        // if on the last checked threshold still 1 or less values are visible, add error
        if (control.controls.indexOf(threshold) === control.controls.length - 1 && foundVisibleCount < 2) {
          errorList.push(i);

          if (!foundError) {
            foundError = true;
          }
        }
      }
    }
    return foundError ? {insufficientEqualsVisible: errorList} : null;
  };
}

/**
 * Validates if a discrete mapping collection contains at least one assigned value for each mapping
 */
export function useValuesDiscreteValidator(): ValidatorFn {
  return (control: FormGroup): ValidationErrors | null => {

    const colValues = (control.get('colValues') as FormArray);
    const collectionSize = (colValues.controls[0].get('assignedValues') as FormArray).length;
    const notUsingValuesOnIndex = [];

    for (let colIndex = 0; colIndex < collectionSize; colIndex++) {
      let foundUsingValue = false;

      for (const row of colValues.controls) {

        if ((row.get('useValues') as FormArray)?.controls[colIndex]?.value) {
          foundUsingValue = true;
        }
      }

      if (!foundUsingValue) {
        notUsingValuesOnIndex.push(colIndex);
      }
    }

    return notUsingValuesOnIndex.length > 0 ? {insufficientValuesVisible: notUsingValuesOnIndex} : null;

  };
}


@Directive({
  selector: '[appUseValuesValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: PatternValidator, multi: true}]
})

export class UseValuesValidatorDirective implements Validator {
  @Input() mappingType: MappingType;

  constructor(private utilityService: UtilityService) {
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.mappingType === this.utilityService.mappingType.discrete) {
      return useValuesDiscreteValidator();
    } else {
      return useValuesContinuousValidator();
    }
  }
}
