import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LayoutService} from '../../../services/layout.service';
import {ElementType, MappingType, UtilityService} from '../../../services/utility.service';
import {NeMappingDiscrete} from '../../../models/ne-mapping-discrete';
import {DataService} from '../../../services/data.service';
import {
  faCheck,
  faCheckCircle,
  faEdit,
  faExclamationTriangle,
  faMagic,
  faPlus,
  faRedo,
  faSearch,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {stylePropertyValidator} from '../../../validators/style-property.directive';
import {Observable, OperatorFunction} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NeAspect} from '../../../models/ne-aspect';
import {NeChart} from '../../../models/ne-chart';
import {useValuesDiscreteValidator} from '../../../validators/use-values.directive';
import {GraphService} from '../../../services/graph.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CommonOSFontConstants, JavaLogicalFontConstants} from 'cytoscape-cx2js';
import {NeFontFace} from '../../../models/ne-font-face';


@Component({
  selector: 'app-sidebar-edit-mapping-discrete',
  templateUrl: './sidebar-edit-mapping-discrete.component.html',
  styleUrls: ['./sidebar-edit-mapping-discrete.component.scss']
})
export class SidebarEditMappingDiscreteComponent implements OnInit, OnDestroy {

  /**
   * Returns the style properties for the discrete mapping form
   */
  get styleProperties(): FormArray {
    return this.discreteMappingForm.get('styleProperties') as FormArray;
  }

  /**
   * Returns the values of this element's attribute, e.g. molecule_type has values "RNA" and "miRNA".
   * Each of these values is associated with their assigned values.
   */
  get colValues(): FormArray {
    return this.discreteMappingForm.get('colValues') as FormArray;
  }

  constructor(
    public layoutService: LayoutService,
    public dataService: DataService,
    public utilityService: UtilityService,
    private graphService: GraphService,
    private modalService: NgbModal
  ) {
  }

  /**
   * Name of this collection's attribute column
   */
  @Input() col;
  /**
   * Type of element this collection refers to
   */
  @Input() elementType: ElementType;
  /**
   * Emitting mapping collection's (un)marked to be deleted
   */
  @Output() markedForDeletionEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * Emitting if a collection is in flashmode to disable routing
   */
  @Output() flashModeEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * Icon: faSearch
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSearch = faSearch;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
  /**
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
  /**
   * Icon: faCheckCircle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheckCircle = faCheckCircle;
  /**
   * Icon: faExclamationTriangle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExclamationTriangle = faExclamationTriangle;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Aspect for this {@link col}
   */
  colProperty: NeAspect;
  /**
   * Histogram containing this {@link col}'s histogram
   */
  chart: NeChart = null;
  /**
   * Mappings to be displayed or edited
   */
  discreteMapping: NeMappingDiscrete[];
  /**
   * Deep copy of mappings currently in editing
   */
  mappingCollectionInEditing: NeMappingDiscrete[];
  /**
   * True, if user is in inspection mode
   */
  inspectionMode = false;
  /**
   * True, if user is in edit mode
   */
  editMode = false;
  /**
   * True, if mapping in editing is flashing the changes
   */
  flashMode = false;
  /**
   * True, if this mapping collection is marked for deletion
   */
  markedForDeletion = false;
  /**
   * True if this col's distribution chart is displayed
   */
  displayChart = false;
  /**
   * True, if the form to add new mappings to this collection is displayed
   */
  showNewMappingForm = false;
  /**
   * Form containing this discrete mapping collection
   */
  discreteMappingForm: FormGroup;
  /**
   * Form to add a new mapping to this collection
   */
  newMappingForm: FormGroup;

  /**
   * Form to edit a font face property
   */
  fontForm: FormGroup;

  /**
   * Indicates that a collection was recently created and enforces that the user submits changes to it
   */
  newlyAdded = false;

  /**
   * List of available fonts
   */
  availableFonts = [];

  /**
   * Java Fonts have modifiers such as italic or bold which are listed here
   */
  javaFontStyles = [];

  /**
   *
   * @param mapping
   * @param propertyValue
   * @private
   */
  private static getValueByMappingAndColProperty(mapping: NeMappingDiscrete, propertyValue: string): string {

    for (const key of Object.keys(mapping.mapObject)) {
      if (key === propertyValue) {
        return mapping.mapObject[key];
      }
    }
    return null;
  }

  /**
   * Interprets a string as fontFaceModel of type {@link NeFontFace}
   * @param definition string representation
   * @private
   */
  private static extractFontFaceFromString(definition: string): NeFontFace {
    if (!!definition) {
      // const cleanDefinition = definition.replace(/,,/g, '%');
      const commaSplit = definition.split(',,');
      return {
        family: commaSplit[0],
        style: commaSplit[1],
        size: commaSplit[2]
      };
    }
    return null;
  }

  /**
   * Translates a {@link NeFontFace} model into its string representation to be rendered by CX2JS
   * @param model model representation
   * @private
   */
  private static buildFontFaceFromModel(model: NeFontFace): string {
    if (!!model) {
      if (!model.style) {
        model.style = 'plain';
      }
      return model.family + ',,' + model.style + ',,' + model.size;
    }
    return null;
  }

  /**
   * Fetches the mapping collection belonging to this {@link col} and {@link elementType}.
   * Also fetches the aspect to this {@link col}
   */
  ngOnInit(): void {
    this.discreteMapping = this.dataService.findAllMappingsDiscreteByCol(this.col, this.elementType);
    this.colProperty = this.dataService.getPropertyByColName(this.col, this.elementType);

    // we manually select a mapping collection when we created one
    if (!!this.dataService.selectedDiscreteMapping
      && this.dataService.selectedDiscreteMapping[0].col === this.col) {
      this.newlyAdded = true;
      this.toggleEditMode();
    }

    this.initFonts();
  }

  /**
   * Initializes font faces available for mapping
   * @private
   */
  private initFonts(): void {
    this.availableFonts = Object.keys(CommonOSFontConstants.FONT_STACK_MAP)
      .concat(JavaLogicalFontConstants.FONT_FAMILY_LIST);

    this.javaFontStyles = Object.keys(JavaLogicalFontConstants.FONT_PROPERTIES_MAP);
  }

  /**
   * Resets properties to defaults and unselects this mapping collection
   */
  ngOnDestroy(): void {
    this.editMode = false;
    this.flashMode = false;
    this.markedForDeletion = false;
    this.newlyAdded = false;
    this.mappingCollectionInEditing = null;

    this.dataService.resetAnyMappingSelection();
    this.markedForDeletionEmitter.emit(false);
    this.flashModeEmitter.emit(false);

    if (this.discreteMappingForm) {
      this.discreteMappingForm.reset();
    }
    if (this.newMappingForm) {
      this.newMappingForm.reset();
    }
  }

  /**
   * Toggles this {@link col}'s histogram
   */
  toggleChart(): void {
    if (!this.displayChart) {
      if (!this.chart) {

        if (this.utilityService.utilFitForContinuous(this.colProperty)) {
          this.chart = this.colProperty.chartDiscreteDistribution;
        } else {
          this.chart = this.colProperty.chartDiscreteDistribution;
        }

      }
      this.displayChart = true;
    } else {
      this.displayChart = false;
    }
  }

  /**
   * Toggles edit mode
   */
  toggleEditMode(): void {
    if (!this.editMode) {
      this.editMode = true;
      this.inspectionMode = false;
      this.mappingCollectionInEditing = [];

      // when a mapping collection was newly added we make this selection previously
      if (!this.newlyAdded) {

        this.dataService.selectMappingDiscrete(this.discreteMapping);
      } else {
        for (const mapping of this.discreteMapping) {
          const valueLength = this.colProperty.values.length;
          mapping.keys = this.colProperty.values;
          mapping.useValue = new Array(valueLength).fill(false);
          mapping.values = new Array(valueLength).fill(null);
        }
      }

      // this.dataService.selectedDiscreteMapping = this.discreteMapping;
      for (const mapping of this.discreteMapping) {
        this.mappingCollectionInEditing.push(this.utilityService.utilDeepCopyMappingDiscrete(mapping));
      }

      this.initDiscreteMappingForm();
      this.initStylePropertyForm();
      this.setValidators();
    } else {
      this.editMode = false;
      this.dataService.resetAnyMappingSelection();
      this.mappingCollectionInEditing = null;
    }
  }

  /**
   * Sets validators for {@link discreteMappingForm} and {@link newMappingForm}
   * @private
   */
  private setValidators(): void {
    this.discreteMappingForm.setValidators([useValuesDiscreteValidator()]);
    this.styleProperties.setValidators([Validators.required]);
  }

  /**
   * Toggles inspection mode
   */
  toggleInspectionMode(): void {
    if (!this.inspectionMode) {
      this.inspectionMode = true;
    } else {
      this.inspectionMode = false;
      this.displayChart = false;
    }
  }

  /**
   * Marks a mapping collection for deletion
   */
  markForDeletion(): void {
    if (!this.markedForDeletion) {
      this.markedForDeletion = true;
      this.markedForDeletionEmitter.emit(true);
    } else {
      this.markedForDeletion = false;
      this.markedForDeletionEmitter.emit(false);
    }
  }

  /**
   * Discards all changes to this mapping in editing
   */
  discardChanges(): void {
    if (this.flashMode) {
      this.toggleFlashMode();
    }
    this.toggleEditMode();
  }

  /**
   * Toggles flash mode
   */
  toggleFlashMode(): void {
    if (!this.flashMode) {
      this.flashMode = true;
      this.discreteMappingForm.disable();

      this.graphService.resetElementSelection();
      this.resetNewMappingForm();
      this.updateMappingCollectionInEditing();
      this.applyChanges(this.mappingCollectionInEditing);
      this.flashModeEmitter.emit(true);

    } else {
      this.flashMode = false;
      this.discreteMappingForm.enable();
      this.graphService.resetElementSelection();

      this.applyChanges(this.discreteMapping);
      this.flashModeEmitter.emit(false);
    }
  }

  /**
   * Removes all mappings by {@link col} and adds the given collection anew to this network.
   * @param mappingCollection The collection of mappings which is to be applied to this network, temporarily or permanently.
   * @private
   */
  private applyChanges(mappingCollection: NeMappingDiscrete[]): void {

    this.dataService.removeAllMappingsByCol(this.col, MappingType.discrete, this.elementType);
    for (const mapping of mappingCollection) {
      this.dataService.addMappingDiscrete(mapping, this.elementType);
    }
  }

  /**
   * Updates the mapping collection in editing according to the {@link discreteMappingForm}
   * @private
   */
  private updateMappingCollectionInEditing(): void {
    this.mappingCollectionInEditing = [];
    const numberOfMappings = this.styleProperties.getRawValue().length;

    for (let i = 0; i < numberOfMappings; i++) {
      const newMapping: NeMappingDiscrete = {
        col: this.col,
        keys: [],
        mapObject: [],
        mappingType: this.utilityService.mappingType.discrete,
        styleProperty: '',
        type: '',
        useValue: [],
        values: [],
        newlyAdded: false
      };

      for (const colValue of this.colValues.controls) {
        const assignedValues = (colValue.get('assignedValues') as FormArray).controls;
        const useValues = (colValue.get('useValues') as FormArray).controls;
        const rowName = colValue.get('colValue').value;

        newMapping.keys.push(rowName);
        newMapping.values.push(assignedValues[i].value);
        newMapping.useValue.push(useValues[i].value);
        newMapping.type = this.colProperty.datatype;
        newMapping.styleProperty = this.styleProperties.controls[i].value;

        // const mapItem = {};
        // mapItem[rowName] = assignedValues[i].value;
        newMapping.mapObject[rowName] = assignedValues[i].value;

      }
      this.mappingCollectionInEditing.push(newMapping);
    }
  }

  /**
   * When adding a mapping to the collection or removing one from it, we need to update the validator for this form.
   * @private
   */
  private updateValidators(): void {
    this.newMappingForm.setValidators([
      Validators.required,
      stylePropertyValidator(
        this.elementType,
        MappingType.discrete,
        this.mappingCollectionInEditing.map(a => a.styleProperty)
      )
    ]);
  }

  /**
   * Initializes the form that maintains this mapping collection
   * @private
   */
  private initDiscreteMappingForm(): void {
    const colValues = new FormArray([]); // rows
    const styleProperties = new FormArray([]); // column headers

    for (const value of this.colProperty.values) {

      const assignedValues = new FormArray([]);
      const useValues = new FormArray([]);
      const attributes = new FormArray([]);

      for (const mapping of this.mappingCollectionInEditing) {
        const styleProperty = mapping.styleProperty;
        const currentlyAssigned = SidebarEditMappingDiscreteComponent.getValueByMappingAndColProperty(mapping, value);

        assignedValues.push(new FormControl(currentlyAssigned));
        attributes.push(new FormControl(this.dataService.getAttributeByStyleProperty(styleProperty)));

        if (currentlyAssigned === null) {
          useValues.push(new FormControl(false));
        } else {
          useValues.push(new FormControl(true));
        }
      }

      const assignedPerValue = new FormGroup({
        colValue: new FormControl(value),
        assignedValues,
        attributes,
        useValues
      });
      colValues.push(assignedPerValue);
    }

    for (const mapping of this.mappingCollectionInEditing) {
      styleProperties.push(new FormControl(mapping.styleProperty));
    }

    this.discreteMappingForm = new FormGroup({
      colValues,
      styleProperties
    });
  }

  /**
   * Initializes the form to add a new mapping to the collection of discrete mappings
   * @private
   */
  private initStylePropertyForm(): void {
    this.newMappingForm = new FormGroup({
      styleProperty: new FormControl(null, [
        Validators.required,
        stylePropertyValidator(
          this.elementType,
          this.utilityService.mappingType.discrete,
          this.mappingCollectionInEditing.map(a => a.styleProperty)
        )
      ])
    });
  }

  /**
   * Resets the form to add a discrete mapping to the collection of discrete mappings
   */
  resetNewMappingForm(): void {

    this.showNewMappingForm = false;
    this.newMappingForm = new FormGroup({
      styleProperty: new FormControl(null, [
        Validators.required,
        stylePropertyValidator(
          this.elementType,
          this.utilityService.mappingType.discrete,
          this.mappingCollectionInEditing.map(a => a.styleProperty)
        )
      ])
    });
  }

  /**
   * Adds a mapping to the discrete mapping collection
   */
  onSubmitNewMappingStyleProperty(): void {
    const styleProperty = this.newMappingForm.get('styleProperty').value;
    const isColor = this.dataService.colorProperties.includes(styleProperty);

    this.styleProperties.push(new FormControl(styleProperty));

    for (const row of this.colValues.controls) {
      (row.get('assignedValues') as FormArray).push(new FormControl(isColor ? '#000000' : null));
      (row.get('attributes') as FormArray).push(new FormControl(this.dataService.getAttributeByStyleProperty(styleProperty)));
      (row.get('useValues') as FormArray).push(new FormControl(false));
    }
    this.resetNewMappingForm();
  }

  /**
   * Removes a discrete mapping from the discrete mapping collection
   * @param stylePropertyIndex Points to the mapping to remove
   */
  removeMapping(stylePropertyIndex: number): void {
    for (const ctrl of this.colValues.controls) {
      (ctrl.get('assignedValues') as FormArray).removeAt(stylePropertyIndex);
      (ctrl.get('attributes') as FormArray).removeAt(stylePropertyIndex);
      (ctrl.get('useValues') as FormArray).removeAt(stylePropertyIndex);
    }
    this.styleProperties.removeAt(stylePropertyIndex);
    this.updateValidators();
  }

  /**
   * Suggests style properties suitable for the given {@link elementType}
   * @param text$ user input, e.g. 'paint' results in suggestions containing 'paint'.
   * Using {@link dataService}'s readonly properties
   */
  suggestStyleProperties: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {

    const properties = this.elementType === ElementType.node
      ? DataService.nodeProperties
      : DataService.edgeProperties;

    const existing = this.styleProperties.getRawValue();
    const available = properties.filter(a => existing.indexOf(a) < 0);

    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '*' ? available : term.length < 1 ? []
        : available.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  }

  /**
   * Submits the edited mapping collection
   */
  onSubmitEdit(): void {
    this.updateMappingCollectionInEditing();
    this.applyAndReturn();
  }

  /**
   * Applies the submitted changes and returns from edit mode
   * @private
   */
  private applyAndReturn(): void {

    if (this.flashMode) {
      this.toggleFlashMode();
    }

    this.newlyAdded = false;
    for (const mapping of this.mappingCollectionInEditing) {
      mapping.newlyAdded = false;
    }

    this.applyChanges(this.mappingCollectionInEditing);
    this.discreteMapping = this.mappingCollectionInEditing;

    this.toggleEditMode();
    // if changes to a newly added mapping were submitted, we need to unmark this collection as new
    // if (this.newlyAdded) {
    //   this.newlyAdded = false;
    // }
  }

  /**
   * Shows a value within the discrete mapping collection by toggling the useValue flag
   * @param colPropertyIndex Index pointing toward the respective attribute's value (row)
   * @param mappingIndex Index pointing toward the respective mapping (column)
   */
  addValue(colPropertyIndex: number, mappingIndex: number): void {
    (this.colValues.controls[colPropertyIndex].get('useValues') as FormArray)
      .controls[mappingIndex].setValue(true);
  }

  /**
   * Hides a value within the discrete mapping collection by toggling the useValue flag
   * @param colPropertyIndex Index pointing toward the respective attribute's value (row)
   * @param mappingIndex Index pointing toward the respective mapping (column)
   */
  removeValue(colPropertyIndex: number, mappingIndex: number): void {
    (this.colValues.controls[colPropertyIndex].get('useValues') as FormArray)
      .controls[mappingIndex].setValue(false);
  }

  /**
   * Resets a mapping column within the discrete mapping collection back to their default values
   * @param styleProperty Name of the mapping's style property
   * @param index Index pointing to the mapping.
   * Might be different than in the original collection when mappings were removed
   */
  resetMapping(styleProperty: string, index: number): void {
    const originalMapping = this.discreteMapping.find(a => a.styleProperty === styleProperty);

    for (const ctrl of this.colValues.controls) {

      const colValue = ctrl.get('colValue').value;
      const originalValue = originalMapping.mapObject[colValue];
      const useValue = originalValue !== undefined;

      (ctrl.get('assignedValues') as FormArray).at(index).setValue(originalValue);
      (ctrl.get('useValues') as FormArray).at(index).setValue(useValue);

    }
  }

  /**
   * Displays the font face form prefilled for a specific index
   * @param content Form
   * @param columnIndex Column index pointing to style property
   * @param rowIndex Row index pointing to value within discrete mapping
   */
  toggleFontFaceDialogue(content, columnIndex: number, rowIndex: number): void {
    this.initFontForm(columnIndex, rowIndex);
    this.modalService.open(content, {size: 'lg'});
  }

  /**
   * Initializes a form to change the font face property
   * @param colIndex Points to the form column
   * @param rowIndex Points to the form row
   */
  initFontForm(colIndex: number, rowIndex: number): void {
    const styleProperty = this.styleProperties.at(colIndex).value;
    const mapping: NeMappingDiscrete = this.mappingCollectionInEditing.find(a => a.styleProperty === styleProperty);
    const currentValue = (this.colValues.controls[rowIndex].get('assignedValues') as FormArray).controls[colIndex].value;
    const fontFaceModel: NeFontFace = SidebarEditMappingDiscreteComponent.extractFontFaceFromString(currentValue);

    const setDefaults = !fontFaceModel;
    const family: FormControl = new FormControl(setDefaults ? '' : fontFaceModel.family, [Validators.required]);
    const style: FormControl = new FormControl(setDefaults ? '' : fontFaceModel.style);
    const size: FormControl = new FormControl(setDefaults ? '' : fontFaceModel.size, [Validators.required]);
    const stylePropertyName: FormControl = new FormControl(styleProperty);
    const elementAttributeName: FormControl = new FormControl(mapping.col);
    const colProperty: FormControl = new FormControl(this.colValues.at(rowIndex).get('colValue').value);
    const isJavaFont: FormControl = new FormControl(setDefaults ? false : this.isJavaLogicalFont(fontFaceModel.family));

    this.fontForm = new FormGroup({
      family,
      style,
      size,
      stylePropertyName,
      elementAttributeName,
      colProperty,
      isJavaFont,
      colIndex: new FormControl(colIndex),
      rowIndex: new FormControl(rowIndex)
    });
  }

  /**
   * True, if the specified string is in {@link JavaLogicalFontConstants}'s font stack
   * @param font name of the font
   */
  isJavaLogicalFont(font: string): boolean {
    return Object.keys(JavaLogicalFontConstants.FONT_STACK_MAP).includes(font);
  }

  /**
   * Assigns a font to the font face form
   * @param font
   */
  setFont(font: string): void {
    const isJava = this.isJavaLogicalFont(font);
    this.fontForm.get('family').setValue(font);
    this.fontForm.get('isJavaFont').setValue(isJava);
  }

  /**
   * Assigns a style to the font face form
   * @param style
   */
  setStyle(style: string): void {
    this.fontForm.get('style').setValue(style);
  }

  /**
   * Resets the font size
   */
  resetSize(): void {
    this.fontForm.get('size').setValue(null);
  }

  /**
   * Submitting the font face form closes the modal
   */
  onSubmitFontForm(): void {
    this.modalService.dismissAll('Submit');

    const rowIndex = this.fontForm.get('rowIndex').value;
    const colIndex = this.fontForm.get('colIndex').value;

    const model = {
      family: this.fontForm.get('family').value,
      style: this.fontForm.get('style').value,
      size: this.fontForm.get('size').value
    };

    (this.colValues.controls[rowIndex].get('assignedValues') as FormArray).controls[colIndex]
      .setValue(SidebarEditMappingDiscreteComponent.buildFontFaceFromModel(model));
  }
}
