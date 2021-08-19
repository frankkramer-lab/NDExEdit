import {ElementType, MappingType} from '../services/utility.service';
import {
  AbstractControl,
  NG_VALIDATORS,
  PatternValidator,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import {DataService} from '../services/data.service';
import {Directive, Input} from '@angular/core';

/**
 * Validates if a styleProperty may be used within this mapping
 * @param elementType Type of the respective element, either 'node' or 'edge'
 * @param mappingType Type of the respective mapping, either 'continuous', 'discrete' or 'continuous'
 * @param existing List of properties, which are already in use within this mapping
 */
export function stylePropertyValidator(elementType: ElementType, mappingType: MappingType, existing: string[]): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const baseList = elementType === ElementType.node ? DataService.nodeProperties : DataService.edgeProperties;
    let available = baseList.filter(a => existing.indexOf(a) < 0);

    if (mappingType === MappingType.continuous) {
      available = available.filter(a => DataService.continuousProperties.indexOf(a) > -1);
    }

    return !available.includes(control.value) ? {stylePropertyName: {value: control.value}} : null;

  };
}

@Directive({
  selector: '[appStylePropertyValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: PatternValidator, multi: true}]
})

export class StylePropertyValidatorDirective implements Validator {
  @Input() stylePropertyName = '';
  @Input() elementType = null;
  @Input() mappingType = null;
  @Input() existingList = [];

  validate(control: AbstractControl): ValidationErrors | null {
    return this.stylePropertyName && this.mappingType && this.elementType ? stylePropertyValidator(this.elementType, this.mappingType, this.existingList) : null;
  }
}


