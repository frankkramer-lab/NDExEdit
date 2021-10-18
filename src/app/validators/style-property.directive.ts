import {ElementType, MappingType} from '../services/utility.service';
import {
  AbstractControl,
  NG_VALIDATORS,
  PatternValidator,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import {Directive, Input} from '@angular/core';
import {PropertyService} from '../services/property.service';

/**
 * Validates if a styleProperty may be used within this mapping
 * @param elementType Type of the respective element, either 'node' or 'edge'
 * @param mappingType Type of the respective mapping, either 'continuous', 'discrete' or 'continuous'
 */
export function stylePropertyValidator(elementType: ElementType, mappingType: MappingType): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    // contains all globally available properties
    const baseList = PropertyService.availableStyleProperties;
    const valids = baseList
      .filter(a => elementType === ElementType.node
        ? PropertyService.nodeProperties.includes(a)
        : PropertyService.edgeProperties.includes(a))
      .filter(a => mappingType === MappingType.continuous
        ? PropertyService.continuousProperties.includes(a)
        : a);

    if (!!control.value) {
      return !valids.includes(control.value)
        ? {stylePropertyName: {value: control.value}}
        : null;
    }
    return null;
  };
}

@Directive({
  selector: '[appStylePropertyValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: PatternValidator, multi: true}]
})

export class StylePropertyValidatorDirective implements Validator {
  @Input() elementType = null;
  @Input() mappingType = null;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.mappingType && this.elementType ? stylePropertyValidator(this.elementType, this.mappingType) : null;
  }
}


