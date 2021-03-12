import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {faCheck, faPlus, faTimes, faTrash, faUndo} from '@fortawesome/free-solid-svg-icons';
import {UtilityService} from '../../../services/utility.service';
import {NeMappingsType} from '../../../models/ne-mappings-type';
import {NeAspect} from '../../../models/ne-aspect';
import {NeMappingContinuous} from '../../../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../../../models/ne-mapping-discrete';
import {NeThresholdMap} from '../../../models/ne-threshold-map';
import {NeMappingPassthrough} from '../../../models/ne-mapping-passthrough';

@Component({
  selector: 'app-main-mappings-new-form',
  templateUrl: './main-mappings-new-form.component.html',
  styleUrls: ['./main-mappings-new-form.component.scss']
})
export class MainMappingsNewFormComponent implements OnInit, OnDestroy {
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
  /**
   * Icon: faUndo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUndo = faUndo;
  /**
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Style property to be mapped
   */
  styleProperty: string;
  /**
   * Type of map, e.g. 'nd' for discrete node mapping
   */
  mapType: string;
  /**
   * Index of a discrete mapping within the list of discrete mappings
   */
  mapId: number;

  /**
   * String containing the attribute's name which is currently used for mapping, e.g. 'Bait_Boolean'
   */
  col: string;
  /**
   * List of thresholds for a continuous mapping,
   * always containing at least 2 entries (default lowest and greatest).
   * Otherwise a continuous mapping does not make any sense.
   */
  thresholds: NeThresholdMap[];
  /**
   * True, if a mapping for this attribute-style-combination already exists.
   * In case of a passthrough mapping this is true, if a passthrough mapping for this style (not considering the data source) exists.
   * Used to disable the submit button.
   */
  alreadyExists = false;
  /**
   * To update a parent, what the user entered as style property, this needs to be emitted
   */
  @Output() stylePropertyEmitter = new EventEmitter<string>();
  /**
   * Essential attribute, determining edit view from creating a new mapping
   */
  @Input() isEdit!: boolean;
  /**
   * Typehint in a more standardised format
   */
  @Input() typeHint!: NeMappingsType;
  /**
   * Discrete mapping
   */
  @Input() mappingDiscrete: NeMappingDiscrete;
  /**
   * Continuous mapping
   */
  @Input() mappingContinuous: NeMappingContinuous;
  /**
   * Passthrough mapping
   */
  @Input() mappingPassthrough: NeMappingPassthrough;
  /**
   * Aspect which is to be mapped
   */
  @Input() propertyToMap: NeAspect;

  constructor(
    public dataService: DataService,
    public utilityService: UtilityService
  ) {
  }

  ngOnInit(): void {
    this.mapType = this.utilityService.utilGetTypeLiteralByTypeHint(this.typeHint);

    if (!this.isEdit) {
      // NEW MAPPING
      if (this.typeHint.ec || this.typeHint.nc) {
        this.initContinuousMapping();
      }
    } else {
      // EDIT MAPPING
      if (this.typeHint.nd || this.typeHint.ed) {
        // discrete
        this.styleProperty = this.mappingDiscrete.styleProperty;
        this.mapId = this.dataService.selectedDiscreteMapping.indexOf(this.mappingDiscrete);
      } else {
        // continuous
        this.prefillContinuousMapping();
      }
    }
  }

  ngOnDestroy(): void {
    this.styleProperty = null;
    this.typeHint = null;
    this.alreadyExists = false;
  }

  /**
   * If the user checks the color property checkbox the color validation is enforced
   * @param b truthy value
   */
  toggleNeedsColorValidation(b: boolean): void {
    if (this.dataService.colorProperties.includes(this.styleProperty) && !b) {
      this.dataService.colorProperties = this.dataService.colorProperties.filter(x => x !== this.styleProperty);
    } else if (!this.dataService.colorProperties.includes(this.styleProperty) && b) {
      this.dataService.colorProperties.push(this.styleProperty);
    }
  }

  /**
   * Returns true, if a given property needs a color preview
   * @param property name of the given property
   */
  needsColorValidation(property: string): boolean {
    return (this.dataService.colorProperties.includes(property));
  }

  /**
   * Adds a new threshold to a continuous mapping
   */
  public addNewThreshold(): void {
    this.thresholds.push({
      value: null,
      propertyValue: '',
      isEditable: true
    });
  }

  /**
   * Clears all inputs for a mapping except the non-manipulatables of a continuous mapping
   */
  clearAllInputs(): void {
    if (!this.isEdit) {
      this.styleProperty = '';
      this.emitStyleProperty();
    }

    this.alreadyExists = false;

    if (this.mappingDiscrete) {
      this.mappingDiscrete.values = [];
    }

    if (this.mappingContinuous) {
      this.thresholds = [
        {
          value: this.propertyToMap.min || null,
          propertyValue: null,
          isEditable: false
        },
        {
          value: this.propertyToMap.max || null,
          propertyValue: null,
          isEditable: false
        },
      ];
      this.mappingContinuous.thresholds = this.thresholds.map(a => a.value);
      this.mappingContinuous.equals = this.thresholds.map(a => a.propertyValue);
    }

    if (this.mappingPassthrough) {
      this.mappingPassthrough.styleProperty = '';
    }
  }

  /**
   * Submits a new continuous mapping
   */
  submitNewContinuousMapping(): void {
    this.thresholds = this.thresholds.sort((a, b) => Number(a.value) > Number(b.value) ? 1 : -1);

    this.mappingContinuous.thresholds = this.thresholds.map(a => String(a.value));
    this.mappingContinuous.equals = this.thresholds.map(a => String(a.propertyValue));

    // trying
    this.mappingContinuous.greaters = this.mappingContinuous.equals;
    this.mappingContinuous.lowers = this.mappingContinuous.equals;

    this.dataService.addMappingContinuous(this.mappingContinuous, this.styleProperty, this.typeHint);
  }

  /**
   * Submits a new discrete mapping, adds CSS property to color properties managed in {@link GraphService}
   */
  submitNewDiscreteMapping(): void {
    this.mappingDiscrete.styleProperty = this.styleProperty;
    this.dataService.addMappingDiscrete(this.mappingDiscrete, this.typeHint);
  }

  /**
   * Submits a new mapping and distributes the requests between discrete and continuous mappings
   */
  submitNewMapping(): void {

    // handles color property management
    if (this.needsColorValidation(this.styleProperty) && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    } else if (!this.needsColorValidation(this.styleProperty) && this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties = this.dataService.colorProperties.filter(x => x !== this.styleProperty);
    }

    if (this.typeHint.nd || this.typeHint.ed) {
      this.submitNewDiscreteMapping();
    } else if (this.typeHint.nc || this.typeHint.ec) {
      this.submitNewContinuousMapping();
    } else {
      this.submitNewPassthroughMapping();
    }
  }

  /**
   * Edits an existing mapping
   */
  editMapping(): void {

    if (this.typeHint.nd || this.typeHint.ed) {
      this.dataService.editMapping(this.typeHint, this.mappingDiscrete, this.mapId);
    } else {
      this.dataService.editMapping(this.typeHint, this.mappingContinuous);
    }
  }

  /**
   * Fetches next ID for the current mapType
   */
  getNextIdForMappingType(): string {
    switch (this.mapType) {
      case 'nd':
        return String(this.dataService.findDiscreteMappingForProperty(
          this.dataService.selectedNetwork.mappings.nodesDiscrete, this.propertyToMap))
          || String(this.dataService.selectedNetwork.mappings.nodesDiscrete.length);
      case 'nc':
        return String(this.dataService.selectedNetwork.mappings.nodesContinuous.length);
      case 'np':
        return String(this.dataService.selectedNetwork.mappings.nodesPassthrough.length);
      case 'ed':
        return String(this.dataService.findDiscreteMappingForProperty(
          this.dataService.selectedNetwork.mappings.edgesDiscrete, this.propertyToMap))
          || String(this.dataService.selectedNetwork.mappings.edgesDiscrete.length);
      case 'ec':
        return String(this.dataService.selectedNetwork.mappings.edgesContinuous.length);
      case 'ep':
        return String(this.dataService.selectedNetwork.mappings.edgesPassthrough.length);
    }
    return String(-1);
  }

  /**
   * Initializes a continuous mapping
   * @private
   */
  private initContinuousMapping(): void {

    this.mappingContinuous = {
      chart: undefined,
      cleanStyleProperty: '',
      col: this.propertyToMap.name || '',
      colorGradient: [],
      equals: undefined,
      greaters: undefined,
      isColor: false,
      lowers: undefined,
      styleProperty: '',
      thresholds: undefined,
      type: this.propertyToMap.datatype || 'string'
    };

    this.thresholds = [
      {
        propertyValue: null,
        value: Number(this.propertyToMap.min) || null,
        isEditable: false
      },
      {
        propertyValue: null,
        value: Number(this.propertyToMap.max) || null,
        isEditable: false
      },
    ];
    console.log(this.propertyToMap);
    this.mappingContinuous.thresholds = this.thresholds.map(a => a.value);
    this.mappingContinuous.equals = this.thresholds.map(a => a.propertyValue);
  }

  /**
   * Prefills the continuous mapping
   */
  prefillContinuousMapping(): void {
    this.mappingContinuous = this.dataService.selectedContinuousMapping;
    this.styleProperty = this.mappingContinuous.styleProperty;

    this.thresholds = [
      // default lower
      {
        value: null,
        propertyValue: this.mappingContinuous.lowers[0] as string,
        isEditable: false
      },
      // default greater
      {
        value: null,
        propertyValue: this.mappingContinuous
          .greaters[this.mappingContinuous.greaters.length - 1] as string,
        isEditable: false
      }];

    for (let i = 0; i < this.mappingContinuous.thresholds.length; i++) {
      const threshold: NeThresholdMap = {
        value: Number(this.mappingContinuous.thresholds[i]),
        propertyValue: this.mappingContinuous.equals[i] as string,
        isEditable: true
      };
      this.thresholds.push(threshold);
    }
  }

  /**
   * Emits the new styleProperty to parent
   */
  emitStyleProperty(): void {
    this.stylePropertyEmitter.emit(this.styleProperty);
    this.alreadyExists = false;

    if (this.typeHint.nd) {
      for (const mapping of this.dataService.selectedNetwork.mappings.nodesDiscrete) {
        if (mapping.col === this.propertyToMap.name && mapping.styleProperty === this.styleProperty) {
          this.alreadyExists = true;
        }
      }
    } else if (this.typeHint.nc) {
      for (const mapping of this.dataService.selectedNetwork.mappings.nodesContinuous) {
        if (mapping.col === this.propertyToMap.name && mapping.styleProperty === this.styleProperty) {
          this.alreadyExists = true;
        }
      }
    } else if (this.typeHint.np) {
      for (const mapping of this.dataService.selectedNetwork.mappings.nodesPassthrough) {
        if (mapping.styleProperty === this.styleProperty) {
          this.alreadyExists = true;
        }
      }
    } else if (this.typeHint.ed) {
      for (const mapping of this.dataService.selectedNetwork.mappings.edgesDiscrete) {
        if (mapping.col === this.propertyToMap.name && mapping.styleProperty === this.styleProperty) {
          this.alreadyExists = true;
        }
      }
    } else if (this.typeHint.ec) {
      for (const mapping of this.dataService.selectedNetwork.mappings.edgesContinuous) {
        if (mapping.col === this.propertyToMap.name && mapping.styleProperty === this.styleProperty) {
          this.alreadyExists = true;
        }
      }
    } else if (this.typeHint.ep) {
      for (const mapping of this.dataService.selectedNetwork.mappings.edgesPassthrough) {
        if (mapping.styleProperty === this.styleProperty) {
          this.alreadyExists = true;
        }
      }
    }
  }

  /**
   * Submits a new discrete mapping, adds CSS property to color properties managed in {@link GraphService}
   */
  private submitNewPassthroughMapping(): void {
    this.mappingPassthrough.styleProperty = this.styleProperty;
    this.dataService.addMappingPassthrough(this.mappingPassthrough, this.typeHint);
  }

  /**
   * Since order cannot be guaranteed between attributes and mappings using these attributes
   * we need to explicitly fetch the index connecting the two.
   *
   * Relates to a discrete mapping. No equivalent for continuous mapping exists yet.
   *
   * @param key Name of the value for which the value is to be determined.
   */
  getIndexByKey(key: string): number {
    const keyIndex = this.mappingDiscrete.keys.indexOf(key);
    if (keyIndex === -1) {
      this.mappingDiscrete.keys.push(key);
      this.mappingDiscrete.values.push('');
      return this.getIndexByKey(key);
    }
    return keyIndex;
  }

  /**
   * Users may now remove a threshold if they don't want to add it to the mapping
   * @param index Points to the threshold to be removed
   */
  removeThreshold(index: number): void {
    this.thresholds.splice(index, 1);
  }
}

