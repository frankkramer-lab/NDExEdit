import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ElementType, MappingType, UtilityService} from '../../../services/utility.service';
import {stylePropertyValidator} from '../../../validators/style-property.directive';
import {DataService} from '../../../services/data.service';
import {NeAspect} from '../../../models/ne-aspect';
import {NeMappingDiscrete} from '../../../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../../../models/ne-mapping-continuous';
import {faLock, faPlus} from '@fortawesome/free-solid-svg-icons';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NeMapping} from '../../../models/ne-mapping';
import {NeMappingEmission} from '../../../models/ne-mapping-emission';
import {PropertyService} from '../../../services/property.service';

@Component({
  selector: 'app-sidebar-edit-add-collection',
  templateUrl: './sidebar-edit-add-collection.component.html',
  styleUrls: ['./sidebar-edit-add-collection.component.scss']
})
export class SidebarEditAddCollectionComponent implements OnInit, OnChanges {

  /**
   * Type of element this form relates to
   */
  @Input() elementType: ElementType;

  /**
   * Type of mapping this form relates to
   */
  @Input() mappingType: MappingType;
  /**
   * True if the form should be locked due to other editing in parent
   */
  @Input() locked: boolean;
  /**
   * On successful submission of a new mapping collection we need to inform the parent
   */
  @Output() newMappingEmitter: EventEmitter<NeMappingEmission> = new EventEmitter<NeMappingEmission>();

  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;

  /**
   * Icon: faLock
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faLock = faLock;

  /**
   * Form to add a new mapping collection
   */
  newCollectionForm: FormGroup;

  /**
   * Prefix for use within HTML to distinguish components
   */
  componentPrefix: string;

  constructor(
    public dataService: DataService,
    public utilityService: UtilityService,
    private propertyService: PropertyService
  ) {
  }

  /**
   * Listens to the parent's changes for flashing or editing in other mappings
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.locked = changes.locked.currentValue;

    if (this.locked !== undefined && !!this.newCollectionForm) {
      if (this.locked) {
        this.newCollectionForm.disable();
      } else if (!this.locked) {
        this.newCollectionForm.enable();
      }
    }
  }

  ngOnInit(): void {
    this.componentPrefix = this.elementType === this.utilityService.elementType.node ? 'node' : 'edge';
    this.setupNewCollectionForm();
  }

  /**
   * Resets the {@link newCollectionForm} and re-adds the validators
   */
  setupNewCollectionForm(): void {
    this.newCollectionForm = new FormGroup({
      property: new FormControl(null, [
        Validators.required
      ]),
      styleProperty: new FormControl(null, [
        Validators.required,
        stylePropertyValidator(this.elementType, this.mappingType)
      ]),
      type: new FormControl(this.mappingType, Validators.required),
      elementType: new FormControl(this.elementType)
    });
  }

  /**
   * Submitting a new mapping collection fetches the property that matches the user-entered property name.
   * Then the respective function to actually add this mapping is triggered.
   */
  onSubmitNewMappingCollection(): void {
    let aspect;

    if (this.elementType === ElementType.node) {
      aspect = this.dataService.selectedNetwork.aspectKeyValuesNodes
        .find(a => a.name === this.newCollectionForm.get('property').value);
    } else {
      aspect = this.dataService.selectedNetwork.aspectKeyValuesEdges
        .find(a => a.name === this.newCollectionForm.get('property').value);
    }
    const emittingObject: NeMappingEmission = {
      mappingType: this.mappingType,
      elementType: this.elementType,
      aspect
    };

    this.propertyService.handleMappingAdded(this.elementType, this.mappingType, aspect.name);

    switch (this.mappingType) {
      case MappingType.discrete:
        this.handleNewDiscrete(aspect);
        break;
      case MappingType.passthrough:
        this.handleNewPassthrough(aspect);
        break;
      case MappingType.continuous:
        this.handleNewContinuous(aspect);
        break;
    }
    this.setupNewCollectionForm();
    this.newMappingEmitter.emit(emittingObject);
  }

  /**
   * Suggests style properties for a new mapping collection.
   * Excluding properties for which already exists a mapping of the selected type
   * and unsuitable properties, e.g. shape properties to be mapped as a continuous mapping.
   */
  suggestStyleProperties(): (text: Observable<string>) => Observable<readonly string[]> {
    return (text$: Observable<string>) => {

      return text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => {

          // todo in case of passthrough mapping check if property is numeric => exclude color styleProperties from suggestions
          // todo adapt form validator to invalidate color styleProperties with numeric properties
          // todo print out a specific error msg for that case, because otherwise it would not be transparent why that combination is not valid

          const available = PropertyService.availableStyleProperties
            .filter(a => this.elementType === ElementType.node
              ? PropertyService.nodeProperties.includes(a)
              : PropertyService.edgeProperties.includes(a))
            .filter(a => this.mappingType === MappingType.continuous
              ? PropertyService.continuousProperties.includes(a)
              : a);

          return term === '*' ? available : term.length < 1 ? []
            : available.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
        })
      );
    };
  }

  /**
   * Suggests element's property which is used in a mapping. Excludes properties for which a mapping of the
   * specified type already exists.
   */
  suggestProperties(): (text: Observable<string>) => Observable<readonly string[]> {
    return (text$: Observable<string>) => {

      const elementKey = this.elementType === this.utilityService.elementType.node ? 'node' : 'edge';
      const mappingKey = this.mappingType === this.utilityService.mappingType.passthrough ? 'p'
        : (this.mappingType === this.utilityService.mappingType.continuous ? 'c' : 'd');

      return text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => {
          const available = this.propertyService.availableElementProperties[elementKey][mappingKey];

          return term === '*' ? available : term.length < 1 ? []
            : available.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
        })
      );
    };
  }

  /**
   * Adds a passthrough mapping collection
   * @param aspect Property matching the user-entered property name
   * @private
   */
  private handleNewPassthrough(aspect: NeAspect): void {
    const newMapping: NeMapping = {
      col: aspect.name,
      mappingType: MappingType.passthrough,
      newlyAdded: true,
      styleProperty: this.newCollectionForm.get('styleProperty').value,
      useValue: []
    };

    this.dataService.addMappingPassthrough(newMapping, this.elementType);
  }

  /**
   * Adds a discrete mapping collection
   * @param aspect Property matching the user-entered property name
   * @private
   */
  private handleNewDiscrete(aspect: NeAspect): void {
    const newMapping: NeMappingDiscrete = {
      col: aspect.name,
      keys: aspect.values,
      mapObject: [],
      mappingType: MappingType.discrete,
      styleProperty: this.newCollectionForm.get('styleProperty').value,
      type: aspect.datatype,
      useValue: [],
      values: [],
      newlyAdded: true
    };

    this.dataService.addMappingDiscrete(newMapping, this.elementType);
  }

  /**
   * Adds a continuous mapping collection
   * @param aspect Property matching the user-entered property name
   * @private
   */
  private handleNewContinuous(aspect: NeAspect): void {
    const newMapping: NeMappingContinuous = {
      chart: null,
      col: aspect.name,
      type: aspect.datatype,
      colorGradient: null,
      duplicates: [],
      equals: [],
      greaters: [],
      isColor: false,
      lowers: [],
      mappingType: MappingType.continuous,
      styleProperty: this.newCollectionForm.get('styleProperty').value,
      thresholds: [],
      useValue: [],
      newlyAdded: true
    };
    this.dataService.addMappingContinuous(newMapping, this.elementType);
  }

}
