import {Component, OnInit} from '@angular/core';
import {InspectionRuleType, UtilityService} from '../../../services/utility.service';
import {NeAspect} from '../../../models/ne-aspect';
import {GraphService} from '../../../services/graph.service';
import {faCheck, faMagic, faRedo, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../../services/data.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NeHighlightForm} from '../../../models/ne-highlight-form';

@Component({
  selector: 'app-sidebar-edit-inspect',
  templateUrl: './sidebar-edit-inspect.component.html',
  styleUrls: ['./sidebar-edit-inspect.component.scss']
})
export class SidebarEditInspectComponent implements OnInit {
  /**
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
  /**
   * List of user defined inspections,
   * e.g. 'Highlight all nodes, where 'Bait_boolean' = 1'
   */
  highlightListDefinition: NeHighlightForm[] = [];
  /**
   * Form for defining a new inspection rule
   */
  ruleForm: FormGroup;
  /**
   * Type of rule (either numeric, bool or text)
   */
  ruleType: InspectionRuleType;
  /**
   * Index pointing towards the rule to delete
   */
  ruleToDelete: number = null;

  /**
   * Contains a rule type specific hint.
   * Should help the user to enter a valid value for the last input field.
   */
  hintTextPrefix = 'SIDEBAR_EDIT_INSPECT_ERROR_VALUE_';

  /**
   * Suffix belonging to {@link hintTextPrefix}, can either be "BOOL", "TEXT" or "NUMERIC"
   */
  hintTextSuffix: string;

  collapsedNewRule = false;

  collapsedRuleList = false;

  constructor(
    public utilityService: UtilityService,
    public graphService: GraphService,
    public dataService: DataService
  ) {
  }

  /**
   * Initializes the rule form and subscribes to any changes on the property control.
   * That we need in order to correctly prefill the form with minimum and maximum values and set respective validators.
   * {@link updateRuleTypeAndHints}
   */
  ngOnInit(): void {
    this.ruleForm = new FormGroup({
      elementType: new FormControl(null, [Validators.required]),
      property: new FormControl(null, [Validators.required]),
      sameAs: new FormControl(null),
      rangeLower: new FormControl(null),
      rangeUpper: new FormControl(null)
    });

    this.ruleForm.get('property').valueChanges.subscribe(selection => {
      this.updateRuleTypeAndHints(selection);
    });
  }

  /**
   * On submission the rule is inserted into the list of rules {@link highlightListDefinition}.
   * The form is reset.
   */
  onSubmitNewInspectionRule(): void {

    const newRule: NeHighlightForm = {
      markedForDeletion: false,
      property: this.ruleForm.get('property').value,
      elementType: this.ruleForm.get('elementType').value,
      ruleType: this.ruleType
    };

    if (this.ruleType === this.utilityService.inspectionRuleType.numeric) {
      newRule.rangeLower = this.ruleForm.get('rangeLower').value;
      newRule.rangeUpper = this.ruleForm.get('rangeUpper').value;
    } else {
      newRule.sameAs = this.ruleForm.get('sameAs').value;
    }

    this.highlightListDefinition.push(newRule);

    this.ruleForm.reset();
  }

  /**
   * Marks a rule within the list {@link highlightListDefinition} for deletion.
   * @param index Points towards the index of the rule in the list
   */
  markToDelete(index: number): void {
    if (this.ruleToDelete === index) {
      this.ruleToDelete = null;
    } else {
      this.ruleToDelete = index;
    }
  }

  /**
   * Actually deletes the marked rule from the list
   */
  deleteRule(): void {
    this.highlightListDefinition.splice(this.ruleToDelete, 1);
    this.ruleToDelete = null;
  }

  /**
   * Flashes this rule for the user-defined amount of time in the user-defined color
   * @param rule Rule to be highlighted
   */
  flash(rule: NeHighlightForm): void {
    if (rule.ruleType === this.utilityService.inspectionRuleType.numeric) {
      this.graphService.highlightByElementRange(rule.elementType, rule.property, rule.rangeLower, rule.rangeUpper);
    } else {
      this.graphService.highlightByElementSameAs(rule.elementType, rule.property, rule.sameAs);
    }
  }

  /**
   * Resets the prefilled form to minimum and maximum.
   * Only valid action for rules of type numeric.
   */
  resetToMinMax(): void {
    if (this.ruleType === this.utilityService.inspectionRuleType.numeric) {
      const property: NeAspect = this.ruleForm.get('property').value;
      this.ruleForm.get('rangeLower').setValue(property.min);
      this.ruleForm.get('rangeUpper').setValue(property.max);
    }
  }

  /**
   * When a property was changed we need to prefill the new fields and update our validators.
   * @param selection Newly selected property
   * @private
   */
  private updateRuleTypeAndHints(selection: NeAspect): void {

    this.ruleType = this.getRuleTypeByProperty(selection);

    this.hintTextSuffix = this.ruleType === this.utilityService.inspectionRuleType.boolean ? 'BOOL'
      : (this.ruleType === this.utilityService.inspectionRuleType.text ? 'TEXT'
        : (this.ruleType === this.utilityService.inspectionRuleType.numeric ? 'NUMERIC' : null));


    switch (this.ruleType) {

      case this.utilityService.inspectionRuleType.numeric:
        this.ruleForm.get('rangeLower').setValue(selection.min);
        this.ruleForm.get('rangeUpper').setValue(selection.max);
        this.ruleForm.get('rangeLower').setValidators(Validators.required);
        this.ruleForm.get('rangeUpper').setValidators(Validators.required);
        const sameAs = this.ruleForm.get('sameAs');
        sameAs.setValidators([]);
        sameAs.reset();
        break;

      case this.utilityService.inspectionRuleType.boolean:
      case this.utilityService.inspectionRuleType.text:
        this.ruleForm.get('rangeLower').reset();
        this.ruleForm.get('rangeLower').setValidators([]);

        this.ruleForm.get('rangeUpper').reset();
        this.ruleForm.get('rangeUpper').setValidators([]);

        this.ruleForm.get('sameAs').setValidators(Validators.required);
        this.ruleForm.get('sameAs').setValue(null);
        break;
    }
  }

  /**
   * Depending on the property's data type a specific form type can be applied
   * @param property The currently selected property
   * @private
   */
  private getRuleTypeByProperty(property: NeAspect): InspectionRuleType {
    let formType: InspectionRuleType = this.utilityService.inspectionRuleType.text;

    if (!property) {
      return null;
    }

    if (this.utilityService.utilFitForContinuous(property)) {
      formType = this.utilityService.inspectionRuleType.numeric;
      this.ruleForm.patchValue({rangeLower: property.min, rangeUpper: property.max});
    } else if (property.datatype === 'boolean') {
      formType = this.utilityService.inspectionRuleType.boolean;
    }
    return formType;
  }

}
