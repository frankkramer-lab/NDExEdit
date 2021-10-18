import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElementType, MappingType, UtilityService} from '../../../services/utility.service';
import {NeMappingContinuous} from '../../../models/ne-mapping-continuous';
import {DataService} from '../../../services/data.service';
import {
  faArrowsAltV,
  faChartLine,
  faCheck,
  faCheckCircle,
  faChevronLeft,
  faEdit,
  faExclamationTriangle,
  faMagic,
  faPalette,
  faPlus,
  faRedo,
  faSearch,
  faSortNumericDown,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import {NeChart} from '../../../models/ne-chart';
import {NeColorGradient} from '../../../models/ne-color-gradient';
import {NeAspect} from '../../../models/ne-aspect';
import {LayoutService} from '../../../services/layout.service';
import {Observable, OperatorFunction} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NeNetwork} from '../../../models/ne-network';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {stylePropertyValidator} from '../../../validators/style-property.directive';
import {ParseService} from '../../../services/parse.service';
import {NeContinuousItemMove} from '../../../models/ne-continuous-item-move';
import {uniqueThresholdsValidator} from '../../../validators/thresholds.directive';
import {useValuesContinuousValidator} from '../../../validators/use-values.directive';
import {GraphService} from '../../../services/graph.service';
import {PropertyService} from '../../../services/property.service';
import {NeVisualAids} from '../../../models/ne-visual-aids';
import {NeVisualAid} from '../../../models/ne-visual-aid';

@Component({
  selector: 'app-sidebar-edit-mapping-continuous',
  templateUrl: './sidebar-edit-mapping-continuous.component.html',
  styleUrls: ['./sidebar-edit-mapping-continuous.component.scss']
})

export class SidebarEditMappingContinuousComponent implements OnInit, OnDestroy {

  /**
   * This mapping's column
   */
  @Input() col: string;
  /**
   * Either node or edge
   */
  @Input() elementType: ElementType;
  /**
   * Emits a continuous mapping collection which is marked for deletion
   */
  @Output() markedForDeletionEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * Emitting if a collection is in flashmode to disable routing
   */
  @Output() flashOrEditModeEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
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
   * True, if a whole mapping collection is marked for deletion
   */
  markedMappingForDeletion = false;
  /**
   * Points to a row within {@link thresholdCollection} which is to be deleted
   */
  markedRowForDeletion: number = null;
  /**
   * Points to a threshold, whose duplicate is marked to be moved
   */
  markedCellMove: NeContinuousItemMove;
  /**
   * True, if input field for new mapping style property is visible
   */
  showNewMappingForm = false;
  /**
   * Deep copy of the network in editing
   */
  changedNetwork: NeNetwork;
  /**
   * Single continuous mapping, whose gradient or line chart is being rendered
   */
  mapping: NeMappingContinuous;
  /**
   * Collection of all continuous mappings for this {@link col}
   */
  mappingCollection: NeMappingContinuous[];
  /**
   * If a collection is in edit mode, this contains a deep copy of the collection, where changes are applied.
   * Only on submission the changes are applied to the original mapping collection.
   */
  mappingCollectionInEditing: NeMappingContinuous[];
  /**
   * List of all thresholds for this {@link mappingCollection}
   */
  thresholdCollection: number[] = [];
  /**
   * This mapping's initially selected property
   */
  prop: string;
  /**
   * Aspect object belonging to this {@link col}
   */
  colProperty: NeAspect;
  /**
   * Only used to add new mappings into the collection
   */
  newMapping: NeMappingContinuous;
  /**
   * Chart object containing either histogram information about {@link colProperty}
   * or a line chart regarding the {@link mapping}
   */
  renderedChart: NeChart;
  /**
   * Gradient object belonging to the {@link mapping}
   */
  renderedGradient: NeColorGradient[];
  /**
   * Icon: faSearch
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSearch = faSearch;
  /**
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faPalette
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPalette = faPalette;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
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
   * Icon: faSortNumericDown
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSortNumericDown = faSortNumericDown;
  /**
   * Icon: faExclamationTriangle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExclamationTriangle = faExclamationTriangle;
  /**
   * Icon: faCheckCircle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheckCircle = faCheckCircle;
  /**
   * Icon: faChartLine
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChartLine = faChartLine;
  /**
   * Icon: faArrowsAltV
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowsAltV = faArrowsAltV;
  /**
   * Icon: faChevronLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronLeft = faChevronLeft;
  /**
   * Form for adding a new mapping to this collection
   */
  newMappingForm: FormGroup;

  /**
   * Form for the mapping in editing
   */
  continuousMappingForm: FormGroup;
  /**
   * True if the mapping collection was recently added.
   * Necessary to correctly toggle edit mode and assure
   * that the user defines values for this collection
   */
  newlyAdded: boolean;
  /**
   * List of visual aids for all mappings in {@link mappingCollection}
   */
  visualAids: NeVisualAids;
  /**
   * List of visual aids for all mappings in {@link mappingCollectionInEditing}
   */
  visualAidsInEditing: NeVisualAids;
  /**
   * Key pointing towards the currently being rendered visual aid
   */
  renderedVisualAidKey: string = null;

  constructor(
    public layoutService: LayoutService,
    public dataService: DataService,
    public utilityService: UtilityService,
    private parseService: ParseService,
    private graphService: GraphService,
    private propertyService: PropertyService
  ) {
    layoutService.layoutEmitter.subscribe(value => this.triggerChartRedraw());
  }

  /**
   * Returns the thresholds for the continuous form
   */
  get thresholds(): FormArray {
    return this.continuousMappingForm.get('thresholds') as FormArray;
  }

  ngOnInit(): void {
    this.mappingCollection = this.dataService.findAllMappingsContinuousByCol(this.col, this.elementType);
    this.colProperty = this.dataService.getPropertyByColName(this.col, this.elementType);
    this.setThresholdCollection();
    this.visualAids = this.buildVisualAidsByCollection(this.mappingCollection);

    // we manually select a mapping collection when we created one
    if (!!this.dataService.selectedContinuousMapping
      && this.dataService.selectedContinuousMapping[0].col === this.col) {
      this.newlyAdded = true;
      this.toggleEditMode();
    }
  }

  ngOnDestroy(): void {
    this.editMode = false;
    this.inspectionMode = false;
    this.flashMode = false;
    this.markedMappingForDeletion = false;
    this.mappingCollectionInEditing = null;
    this.dataService.resetAnyMappingSelection();
    this.markedForDeletionEmitter.emit(false);
    this.flashOrEditModeEmitter.emit(false);
  }

  /**
   * Builds the {@link visualAids} and {@link visualAidsInEditing} based on the current status of
   * the {@link mappingCollection} and {@link mappingCollectionInEditing}.
   * @param mappingCollection Collection for which the visual aids are calculated
   * @private
   */
  private buildVisualAidsByCollection(mappingCollection: NeMappingContinuous[]): NeVisualAids {

    const visualAids: NeVisualAids = {histogram: undefined};

    // add histogram to both the visual aids and visual aids in editing
    const histogram = this.colProperty.chartContinuousDistribution || this.colProperty.chartDiscreteDistribution;
    visualAids.histogram = {
      isValid: true,
      isHistogram: true,
      chartObj: histogram,
      gradientObj: null
    };

    for (const mapping of this.mappingCollection) {
      const visualAid: NeVisualAid = {
        isValid: true,
        isHistogram: false,
        chartObj: null,
        gradientObj: null
      };
      if (mapping.isColor) {
        visualAid.gradientObj = this.parseService.buildColorGradient(mapping);
        if (visualAid.gradientObj === null) {
          visualAid.isValid = false;
        }
      } else {
        visualAid.chartObj = this.parseService.buildChartData(mapping);
        if (visualAid.chartObj === null) {
          visualAid.isValid = false;
        }
      }
      visualAids[mapping.styleProperty] = visualAid;
    }
    return visualAids;
  }

  /**
   * Which visual aid is being displayed is determined by the {@link renderedVisualAidKey},
   * since the lists {@link visualAidsInEditing} and {@link visualAids} consist of these keys
   * @param propertyName Key to be set
   */
  showVisualAid(propertyName: string): void {
    this.renderedVisualAidKey = propertyName;
  }

  /**
   * Toggles marked for deletion bool and emits the value to parent
   */
  toggleMarkedForDeletion(): void {
    this.markedMappingForDeletion = !this.markedMappingForDeletion;
    this.markedForDeletionEmitter.emit(this.markedMappingForDeletion);
  }

  /**
   * Marks a duplicate entry for moving. The user then can assign this value to another threshold
   * @param mapIndex Corresponding mapping
   * @param thIndex Index of threshold with duplicate
   * @param dupIndex Index of duplicate within this threshold (there might be more than 1 duplicate value for one threshold)
   */
  toggleMoveCell(mapIndex: number, thIndex: number, dupIndex: number = -1): void {
    if (this.markedCellMove.mappingIndex === -1) {
      this.markedCellMove.mappingIndex = mapIndex;
      this.markedCellMove.sourceThresholdIndex = thIndex;
      this.markedCellMove.duplicateIndex = dupIndex;
    } else {
      this.resetCellMoving();
    }
  }

  /**
   * Builds a css color gradient based on the gradient object
   * @param gradientObject A mapping's gradient object. Can only exist for color mappings
   */
  buildColorGradientCssBackground(gradientObject: NeColorGradient[]): string {
    if (gradientObject.length === 0) {
      return '';
    }
    let color = 'linear-gradient(90deg, ';
    const tmp = [];

    let foundLowest = false;
    let foundHighest = false;

    for (const gradient of gradientObject) {
      if (gradient.offset === '0%') {
        foundLowest = true;
      }
      if (gradient.offset === '100%') {
        foundHighest = true;
      }

      if (gradient.offset !== '-1' && gradient.offset !== '101') {
        tmp.push(gradient.color.concat(' '.concat(gradient.offset)));
      }
    }

    if (!foundLowest) {
      const lowestFallback = gradientObject.find(x => x.offset === '-1');
      tmp.splice(0, 0, lowestFallback.color.concat(' '.concat('0%')));
    }

    if (!foundHighest) {
      const highestFallback = gradientObject.find(x => x.offset === '101');
      tmp.push(highestFallback.color.concat(' '.concat('100%')));
    }

    color = color.concat(tmp.join(', '));
    color = color.concat(')');
    return gradientObject[0].color + ' ' + color;
  }

  /**
   * Toggles edit mode.
   * If it switches to true, the mapping collection is selected within the {@link dataService}
   * to assure isolated changes.
   */
  toggleEditMode(): void {

    if (!this.editMode) {
      this.editMode = true;
      this.flashMode = false;
      this.inspectionMode = false;

      // when a mapping collection was newly added we make this selection previously
      if (!this.newlyAdded) {
        this.dataService.selectMappingContinuous(this.mappingCollection);
      }

      this.mappingCollectionInEditing = [];

      for (const mapping of this.mappingCollection) {
        this.mappingCollectionInEditing.push(this.utilityService.utilDeepCopyMappingContinuous(mapping, this.thresholdCollection));
      }
      this.visualAidsInEditing = this.buildVisualAidsByCollection(this.mappingCollectionInEditing);
      this.renderedVisualAidKey = (this.mappingCollectionInEditing.length > 1 || this.newlyAdded)
        ? 'histogram'
        : this.mappingCollectionInEditing[0].styleProperty;
      this.resetCellMoving();
      this.initContinuousMappingForm();
      this.resetContinuousMappingForm();
      this.resetNewMappingForm();
      this.flashOrEditModeEmitter.emit(true);

    } else {
      this.editMode = false;
      this.flashMode = false;
      this.inspectionMode = true;
      this.visualAidsInEditing = null;
      this.dataService.resetAnyMappingSelection();
      this.mappingCollectionInEditing = null;
      this.flashOrEditModeEmitter.emit(false);
    }
  }

  /**
   * Toggles inspection mode.
   */
  toggleInspectionMode(): void {
    if (!this.inspectionMode) {
      this.renderedVisualAidKey = this.mappingCollection.length > 1 ? 'histogram' : this.mappingCollection[0].styleProperty;
      this.col = this.colProperty.name;
      this.inspectionMode = true;

    } else {
      this.inspectionMode = false;
    }
  }

  /**
   * Toggles flash mode.
   * Changes made in the editing form are applied to the network.
   * In this mode the user cannot edit the mapping any further, also no other mappings can be selected for editing.
   */
  toggleFlashMode(): void {
    if (!this.flashMode) {
      this.flashMode = true;
      this.continuousMappingForm.disable();

      this.graphService.resetElementSelection();
      this.resetNewMappingForm();
      this.updateMappingCollectionInEditing();
      this.applyChanges(this.mappingCollectionInEditing);
      this.flashOrEditModeEmitter.emit(true);

    } else {
      this.flashMode = false;
      this.continuousMappingForm.enable();
      this.graphService.resetElementSelection();

      this.applyChanges(this.mappingCollection);
      this.flashOrEditModeEmitter.emit(false);
    }
  }

  /**
   * Applies changes to the mapping and returns to inspection mode.
   * Thus unlocking other mappings for editing.
   */
  applyAndReturn(): void {
    // if changes to a newly added mapping were submitted, we need to unmark this collection as new
    if (this.newlyAdded) {
      this.newlyAdded = false;
    }
    if (this.flashMode) {
      this.toggleFlashMode();
    }

    this.applyChanges(this.mappingCollectionInEditing);
    this.mappingCollection = this.mappingCollectionInEditing;
    this.visualAidsInEditing = null;
    this.visualAids = this.buildVisualAidsByCollection(this.mappingCollection);
    this.renderedVisualAidKey = this.mappingCollection.length > 1 ? 'histogram' : this.mappingCollection[0].styleProperty;
    this.toggleEditMode();
  }

  /**
   * Returns from editing mode without applying any changes.
   */
  discardChanges(): void {
    if (this.flashMode) {
      this.toggleFlashMode();
    }
    this.toggleEditMode();
  }

  /**
   * Resets a mapping to its default values, before the user made any changes
   * @param styleProperty Name of a mapping's style property to reset to default
   * @param mappingIndex Its index within the {@link mappingCollectionInEditing}
   */
  resetStylePropertyToDefaults(styleProperty: string, mappingIndex: number): void {
    const originalMapping = this.mappingCollection.find(a => a.styleProperty === styleProperty);
    if (!!originalMapping) {
      this.deleteMappingFromCollection(styleProperty);
      this.addMappingToForm(originalMapping, mappingIndex);
      this.propertyService.handleStyleAdded(styleProperty);
      this.updateMappingCollectionInEditing();
    }
  }

  /**
   * Adds a cell to this mapping collection
   * @param mappingIndex corresponds to the column within this collection
   * @param thresholdIndex corresponds to the row within this collection
   */
  addCellToMapping(mappingIndex: number, thresholdIndex: number): void {
    (this.thresholds.controls[thresholdIndex].get('useValues') as FormArray).controls[mappingIndex].setValue(true);
  }

  /**
   * Removes an entry for this mapping and threshold
   * @param mappingIndex corresponds to the column within this collection
   * @param thresholdIndex corresponds to the row within this collection
   * @param duplicateIndex corresponds to a duplicate within the mapping, when the item to be deleted is a duplicate
   */
  removeCellFromMapping(mappingIndex: number, thresholdIndex: number, duplicateIndex: number = -1): void {
    if (duplicateIndex === -1 && !this.thresholdHasDuplicates(thresholdIndex)) {

      // hide cell, if this item is no duplicate and if this threshold does not have any duplicates
      (this.thresholds.controls[thresholdIndex].get('useValues') as FormArray).controls[mappingIndex].setValue(false);

    } else if (duplicateIndex === -1 && this.thresholdHasDuplicates(thresholdIndex, mappingIndex)) {

      // if this threshold has a duplicate somewhere, but is not one of the duplicates
      // delete this equals value
      const nextDuplicateValue = ((this.thresholds.controls[thresholdIndex].get('duplicates') as FormArray)
        .controls[mappingIndex] as FormArray).controls[0].value;

      (this.thresholds.controls[thresholdIndex].get('equals') as FormArray).controls[mappingIndex].setValue(nextDuplicateValue);
      ((this.thresholds.controls[thresholdIndex].get('duplicates') as FormArray)
        .controls[mappingIndex] as FormArray)
        .removeAt(0);

    } else {

      // if is a duplicate, remove
      ((this.thresholds.controls[thresholdIndex].get('duplicates') as FormArray)
        .controls[mappingIndex] as FormArray)
        .removeAt(duplicateIndex);
    }
  }

  /**
   * Suggests style properties suitable for the given {@link elementType}
   * @param text$ user input, e.g. 'paint' results in suggestions containing 'paint'.
   * Using {@link dataService}'s readonly properties
   */
  suggestStyleProperties: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {

    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {

        const available = PropertyService.availableStyleProperties
          .filter(a => this.elementType === ElementType.node
            ? PropertyService.nodeProperties.includes(a)
            : PropertyService.edgeProperties.includes(a))
          .filter(a => PropertyService.continuousProperties.includes(a));

        return term === '*' ? available : term.length < 1 ? []
          : available.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
      })
    );
  }

  /**
   * Removes a mapping from the collection currently in edit mode
   * @param styleProperty Name of this mapping's styleProperty
   */
  deleteMappingFromCollection(styleProperty: string): void {
    const currentCollection = this.getMappingsByThresholdsForm();
    const index = currentCollection.findIndex(a => a.styleProperty === styleProperty);

    for (const threshold of this.thresholds.controls) {
      (threshold.get('equals') as FormArray).removeAt(index);
      (threshold.get('useValues') as FormArray).removeAt(index);
      (threshold.get('duplicates') as FormArray).removeAt(index);
      (threshold.get('styleProperty') as FormArray).removeAt(index);
      (threshold.get('isColor') as FormArray).removeAt(index);
    }
    this.updateMappingCollectionInEditing();
    this.propertyService.handleStyleRemoved(styleProperty);
    // collapses the new mapping form and assures that all available styleProperties are recognised as such
    this.resetNewMappingForm();
  }

  /**
   * Overrides the mapping in editing with the newly defined values
   */
  onSubmitMappingChanged(): void {
    this.updateMappingCollectionInEditing();
    this.applyAndReturn();
  }

  /**
   * Inserts the style property as new mapping into the mappingCollection
   */
  onSubmitNewMappingStyleProperty(): void {
    const isColor = PropertyService.colorProperties.includes(this.newMappingForm.value.styleProperty);

    for (const threshold of this.thresholds.controls) {
      (threshold.get('equals') as FormArray).push(new FormControl(isColor ? '#000000' : null));
      (threshold.get('useValues') as FormArray).push(new FormControl(false));
      (threshold.get('duplicates') as FormArray).push(new FormControl([]));
      (threshold.get('isColor') as FormArray).push(new FormControl(isColor));
      (threshold.get('styleProperty') as FormArray).push(new FormControl(this.newMappingForm.value.styleProperty));

    }
    this.propertyService.handleStyleAdded(this.newMappingForm.value.styleProperty);
    this.visualAidsInEditing[this.newMappingForm.value.styleProperty] = {
      chartObj: undefined,
      gradientObj: [],
      isHistogram: false,
      isValid: false
    };
    this.updateMappingCollectionInEditing();
    this.resetNewMappingForm();
  }

  /**
   * Resets the input field for a new mapping's style property
   */
  resetNewMappingForm(): void {
    this.newMapping = {
      chart: null,
      colorGradient: null,
      equals: [],
      greaters: [],
      duplicates: [],
      isColor: false,
      lowers: [],
      mappingType: MappingType.continuous,
      thresholds: [],
      col: this.col,
      styleProperty: '',
      useValue: [],
      newlyAdded: false
    };
    this.showNewMappingForm = false;
    this.newMappingForm = new FormGroup({
      styleProperty: new FormControl(null, [
        Validators.required,
        stylePropertyValidator(this.elementType, MappingType.continuous)
      ])
    });
  }

  /**
   * Sorts equals, lowers, greaters, useValue, duplicates and thresholds by ascending by thresholds.
   */
  sortAscendingByThreshold(): void {
    this.thresholds.controls.sort((a, b) => a.get('threshold').value > b.get('threshold').value ? 1 : -1);
  }

  /**
   * Adds a threshold to this mapping
   * @param value Value for the newly assigned threshold, empty by default
   */
  addThresholdToMapping(value: number = null): void {
    const duplicates = new FormArray([]);
    const equals = new FormArray([]);
    const isColor = new FormArray([]);
    const useValues = new FormArray([]);
    const styleProperty = new FormArray([]);

    const newThreshold: FormControl = new FormControl(value, [Validators.required]);
    newThreshold.markAsTouched();

    for (const mapping of this.mappingCollectionInEditing) {

      const newEquals: FormControl = new FormControl(mapping.isColor ? '#000000' : null);
      newEquals.markAsTouched();

      duplicates.push(new FormControl([], [Validators.maxLength(0)]));
      equals.push(new FormControl());
      isColor.push(new FormControl(mapping.isColor));
      useValues.push(new FormControl(false));
      styleProperty.push(new FormControl(mapping.styleProperty));
    }
    this.thresholds.push(new FormGroup({
      duplicates,
      equals,
      isColor,
      useValues,
      threshold: newThreshold,
      styleProperty
    }));
  }

  /**
   * Removes a threshold from this mapping collection
   */
  removeThresholdFromMapping(): void {
    if (this.markedRowForDeletion === null) {
      return;
    }
    this.thresholds.removeAt(this.markedRowForDeletion);
    this.markedRowForDeletion = null;
  }

  /**
   * Actually moves a duplicate value
   * @param targetThresholdIndex Position where the duplicate should be placed
   * @param isColor True if the mapping is a color mapping
   */
  moveCell(targetThresholdIndex: number, isColor: boolean): void {
    let sourceControl;
    let sourceValue;

    if (this.markedCellMove.duplicateIndex !== -1) {
      // duplicate is to be moved
      sourceControl = ((this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('duplicates') as FormArray)
        .controls[this.markedCellMove.mappingIndex] as FormArray)
        .controls[this.markedCellMove.duplicateIndex];
    } else {
      // regular cell is to be moved
      sourceControl = (this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('equals') as FormArray)
        .controls[this.markedCellMove.mappingIndex];
    }
    sourceValue = sourceControl.value;

    // assign value to new cell
    ((this.thresholds.controls[targetThresholdIndex].get('equals') as FormArray)
      .controls[this.markedCellMove.mappingIndex]).setValue(sourceValue);

    // new cell should display the value
    ((this.thresholds.controls[targetThresholdIndex].get('useValues') as FormArray)
      .controls[this.markedCellMove.mappingIndex]).setValue(true);

    if (this.markedCellMove.duplicateIndex === -1 && !this.thresholdHasDuplicates(this.markedCellMove.sourceThresholdIndex)) {
      // when moving a regular cell without duplicates
      // set value to default and hide it
      ((this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('equals') as FormArray)
        .controls[this.markedCellMove.mappingIndex]).setValue(isColor ? '#000000' : null);
      (this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('useValues') as FormArray)
        .controls[this.markedCellMove.mappingIndex].setValue(false);

    } else if (this.markedCellMove.duplicateIndex === -1) {
      // when moving a regular cell with duplicates
      // make the first duplicate the new equals value and remove it as duplicate
      const firstDuplicateValue = ((this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('duplicates') as FormArray)
        .controls[this.markedCellMove.mappingIndex] as FormArray)
        .controls[0].value;
      ((this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('equals') as FormArray)
        .controls[this.markedCellMove.mappingIndex]).setValue(firstDuplicateValue);
      ((this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('duplicates') as FormArray)
        .controls[this.markedCellMove.mappingIndex] as FormArray)
        .removeAt(this.markedCellMove.duplicateIndex);

    } else {
      // when moving a duplicate cell
      // remove the source
      ((this.thresholds.controls[this.markedCellMove.sourceThresholdIndex].get('duplicates') as FormArray)
        .controls[this.markedCellMove.mappingIndex] as FormArray)
        .removeAt(this.markedCellMove.duplicateIndex);
    }

    this.resetCellMoving();
  }

  /**
   * Returns true if the specified threshold has a mapping somewhere in the collection
   * @param thresholdIndex index pointing to the threshold to be checked
   * @param mappingIndex index pointing to a specific mapping. If none is given, all mappings are checked for duplicates
   */
  thresholdHasDuplicates(thresholdIndex: number, mappingIndex = -1): boolean {
    const thresholdsDuplicates = (this.thresholds.at(thresholdIndex).get('duplicates') as FormArray);
    const hasThresholdsDuplicates = thresholdsDuplicates.controls.some((a: FormArray) => a.length > 0);

    if (mappingIndex !== -1) {
      const thresholdsDuplicatesByMapping = (thresholdsDuplicates.at(mappingIndex) as FormArray);
      return thresholdsDuplicatesByMapping.length > 0;
    } else {
      return hasThresholdsDuplicates;
    }
  }

  /**
   * Sets the number of bins to a new value
   * @param $event the new value
   * @param property aspect whose number of bins is to be changed
   */
  setBinSize($event: number, property: NeAspect): void {
    if (this.editMode) {
      this.visualAidsInEditing.histogram.chartObj = this.utilityService.utilSetBinSize($event, property);
    } else {
      this.visualAids.histogram.chartObj = this.utilityService.utilSetBinSize($event, property);
    }
    this.triggerChartRedraw();
  }

  /**
   * Applies changes to the network.
   * Used for both flashing changes and finally applying the changes
   * @param mappingCollection
   */
  private applyChanges(mappingCollection: NeMappingContinuous[]): void {
    this.dataService.removeAllMappingsByCol(this.col, MappingType.continuous, this.elementType);
    for (const mapping of mappingCollection) {
      this.dataService.addMappingContinuous(mapping, this.elementType);
    }
  }

  /**
   * Collects unique thresholds throughout the mapping collection
   * @private
   */
  private setThresholdCollection(): void {

    for (const mapping of this.mappingCollection) {
      for (const th of mapping.thresholds) {

        if (!this.thresholdCollection.includes(th)) {
          this.thresholdCollection.push(th);
        }
      }
    }

    this.thresholdCollection = this.thresholdCollection.sort((a, b) => a > b ? 1 : -1);

  }

  /**
   * Updates the {@link mappingCollectionInEditing} by the current values from the {@link continuousMappingForm}.
   * Used when applying flashMode or when finally applying the changes.
   * Also used when visual aids have to be displayed during edit mode.
   * @private
   */
  private updateMappingCollectionInEditing(): void {
    this.sortAscendingByThreshold();

    this.thresholdCollection = [];
    for (const th of this.thresholds.controls) {
      this.thresholdCollection.push(th.get('threshold').value);
    }
    this.mappingCollectionInEditing = this.getMappingsByThresholdsForm();
  }

  /**
   * Returns a mapping collection based on the current state of the continuous mapping form
   * @private
   */
  private getMappingsByThresholdsForm(): NeMappingContinuous[] {
    const mappings: NeMappingContinuous[] = [];
    if (this.thresholds.controls.length < 1) {
      return [];
    }
    const numberOfMappings = (this.thresholds.controls[0].get('equals') as FormArray).controls.length;

    for (let i = 0; i < numberOfMappings; i++) {

      const newMapping: NeMappingContinuous = {
        chart: null,
        col: this.col,
        colorGradient: null,
        duplicates: [],
        equals: [],
        greaters: [],
        isColor: false,
        lowers: [],
        mappingType: MappingType.continuous,
        styleProperty: null,
        thresholds: [],
        useValue: [],
        type: this.colProperty.datatype,
        newlyAdded: false
      };

      for (const th of this.thresholds.controls) {
        const isColor = th.get('isColor').value[i];

        newMapping.equals.push((th.get('equals') as FormArray).controls[i].value);
        newMapping.greaters.push(isColor ? '#000000' : null);
        newMapping.lowers.push(isColor ? '#000000' : null);
        newMapping.useValue.push((th.get('useValues') as FormArray).controls[i].value);
        newMapping.duplicates.push((th.get('duplicates') as FormArray).controls[i].value);
        newMapping.thresholds.push(th.get('threshold').value);

        newMapping.isColor = isColor;
        newMapping.styleProperty = th.get('styleProperty').value[i];
      }
      // const index = mappings.findIndex(a => a.styleProperty === newMapping.styleProperty);
      mappings.push(newMapping);
    }
    return mappings;
  }

  /**
   * Initializes the form to edit a continuous mapping collection
   * @private
   */
  private resetContinuousMappingForm(): void {

    this.thresholds.reset(new FormArray([]));
    this.thresholds.setValidators([
      uniqueThresholdsValidator(), // thresholds need to be unique
      Validators.minLength(2), // at least 2 thresholds must be defined
      useValuesContinuousValidator() // for each mapping at least two assigned values must be visible
    ]);

    for (const th of this.thresholdCollection) {
      this.thresholds.push(new FormGroup({
        threshold: new FormControl(th, [Validators.required]),
        styleProperty: new FormArray([]),
        isColor: new FormArray([]),
        equals: new FormArray([], [Validators.required]),
        useValues: new FormArray([]),
        duplicates: new FormArray([])
      }));
    }

    for (let i = 0; i < this.mappingCollectionInEditing.length; i++) {
      this.addMappingToForm(this.mappingCollectionInEditing[i], i);
    }
  }

  /**
   * Resets the duplicate management object to default values
   * @private
   */
  private resetCellMoving(): void {
    this.markedCellMove = {
      duplicateIndex: -1, mappingIndex: -1, sourceThresholdIndex: -1
    };
  }

  /**
   * Adds a continuous mapping to the continuous mapping form at the specified index.
   * Used to reset a mapping to its default
   * @param originalMapping The mapping's original values
   * @param mappingIndex Index where the mapping is to be placed
   * @private
   */
  private addMappingToForm(originalMapping: NeMappingContinuous, mappingIndex: number): void {
    const thresholdValues = this.thresholds.controls.map(a => a.get('threshold').value);

    for (const threshold of originalMapping.thresholds) {
      if (!thresholdValues.includes(threshold)) {
        this.addThresholdToMapping(threshold);
      }
    }
    this.sortAscendingByThreshold();

    for (const th of this.thresholds.controls) {
      const mappingThresholdIndex = originalMapping.thresholds.findIndex(a => a === th.get('threshold').value);

      if (mappingThresholdIndex !== -1) {
        // threshold exists for this mapping
        // assign original values and display
        const duplicates = new FormArray([], [Validators.maxLength(0)]);
        if (originalMapping.duplicates[mappingThresholdIndex]?.length > 0) {
          for (const d of originalMapping.duplicates[mappingThresholdIndex]) {
            duplicates.push(new FormControl(d));
          }
        }

        (th.get('equals') as FormArray).insert(mappingIndex, new FormControl(originalMapping.equals[mappingThresholdIndex]));
        (th.get('useValues') as FormArray).insert(mappingIndex, new FormControl(originalMapping.useValue[mappingThresholdIndex]));
        (th.get('duplicates') as FormArray).insert(mappingIndex, duplicates);
        (th.get('isColor') as FormArray).insert(mappingIndex, new FormControl(originalMapping.isColor));
        (th.get('styleProperty') as FormArray).insert(mappingIndex, new FormControl(originalMapping.styleProperty));
      } else {
        // threshold does not exist for this mapping
        // fill with defaults and hide
        (th.get('equals') as FormArray).insert(mappingIndex, new FormControl(originalMapping.isColor ? '#000000' : null));
        (th.get('useValues') as FormArray).insert(mappingIndex, new FormControl(false));
        (th.get('duplicates') as FormArray).insert(mappingIndex, new FormArray([]));
        (th.get('isColor') as FormArray).insert(mappingIndex, new FormControl(originalMapping.isColor));
        (th.get('styleProperty') as FormArray).insert(mappingIndex, new FormControl(originalMapping.styleProperty));

      }
    }
  }

  /**
   * Before we can work with our form, we need to initialize it, meaning assign a FormGroup containing all
   * our nested forms and assigning the thresholds at the top level
   * @private
   */
  private initContinuousMappingForm(): void {
    this.continuousMappingForm = new FormGroup({});
    this.continuousMappingForm.addControl('thresholds', new FormArray([]));
  }

  /**
   * Redraws the chart
   * @private
   */
  private triggerChartRedraw(): void {
    if (!!this.renderedVisualAidKey) {
      if (this.editMode) {
        if (this.visualAidsInEditing[this.renderedVisualAidKey].chartObj !== null) {
          this.visualAidsInEditing[this.renderedVisualAidKey].chartObj.chartColors = this.utilityService.utilGetRandomColorForChart();
        }
      } else {
        if (this.visualAids[this.renderedVisualAidKey].chartObj !== null) {
          this.visualAids[this.renderedVisualAidKey].chartObj.chartColors = this.utilityService.utilGetRandomColorForChart();
        }
      }
    }
  }

  /**
   * Abort adding a new collection
   */
  removeNewlyAdded(): void {
    const mapping = this.mappingCollectionInEditing[0];

    this.dataService.removeAllMappingsByCol(mapping.col, mapping.mappingType, this.elementType);
    this.propertyService.handleMappingRemoved(this.elementType, MappingType.continuous, mapping.col);
    this.propertyService.handleStyleRemoved(mapping.styleProperty);
    this.toggleEditMode();
  }
}
