import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {faCheck, faPlus, faTimes, faUndo} from '@fortawesome/free-solid-svg-icons';
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
  @Input() alreadyExists = false;
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

  constructor(public dataService: DataService, public utilityService: UtilityService) {
  }

  ngOnInit(): void {
    this.mapType = this.utilityService.utilGetTypeLiteralByTypeHint(this.typeHint);

    if (!this.isEdit) {
      if (this.typeHint.ec || this.typeHint.nc) {
        this.initContinuousMapping();
      }
    } else {
      // let existingMapping;
      // if (this.typeHint.nd) {
      //   existingMapping = this.dataService.selectedNetwork.mappings.nodesDiscrete[this.mapId];
      //   this.prefillDiscreteMapping(existingMapping, this.propertyPointer, true);
      // } else if (this.typeHint.ed) {
      //   existingMapping = this.dataService.selectedNetwork.mappings.edgesDiscrete[this.mapId];
      //   this.prefillDiscreteMapping(existingMapping, this.propertyPointer, false);
      // } else if (this.typeHint.ec) {
      //   existingMapping = this.dataService.selectedNetwork.mappings.edgesContinuous[this.mapId];
      //   this.prefillContinuousMapping(existingMapping);
      // } else if (this.typeHint.nc) {
      //   existingMapping = this.dataService.selectedNetwork.mappings.nodesContinuous[this.mapId];
      //   this.prefillContinuousMapping(existingMapping);
      // }
    }
    // this.isInitialized = true;
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
    this.styleProperty = '';
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

    console.log(this.mappingContinuous);

    this.dataService.addMappingContinuous(this.mappingContinuous, this.styleProperty, this.typeHint);

    // this.continuousMapping.cssKey = this.styleProperty;
    // this.continuousMapping.mappedProperty = this.propertyToMap;
    // this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.filter(x => x.value !== null);
    // this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.sort((a, b) => (a.value < b.value ? -1 : 1));
    // this.continuousMapping.defaultGreater = this.continuousMapping.breakpoints[this.continuousMapping.breakpoints.length - 1].propertyValue;
    // this.continuousMapping.defaultLower = this.continuousMapping.breakpoints[0].propertyValue;

    // this.dataService.addMappingContinuous(this.dataService.networkSelected.id, this.typeHint.nc, this.continuousMapping);

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
    // if (this.typeHint.nd || this.typeHint.ed) {
    //   this.dataService.editMapping(this.dataService.networkSelected.id, this.discreteMapping, this.styleProperty, this.typeHint);
    // } else {
    //   this.dataService.editMapping(this.dataService.networkSelected.id, this.continuousMapping, this.styleProperty, this.typeHint);
    // }
  }

  /**
   * Fetches next ID for the current mapType
   */
  getNextIdForMappingType(): string {
    switch (this.mapType) {
      case 'nd':
        return String(this.dataService.findDiscreteMappingForProperty(this.dataService.selectedNetwork.mappings.nodesDiscrete, this.propertyToMap))
          || String(this.dataService.selectedNetwork.mappings.nodesDiscrete.length);
      case 'nc':
        return String(this.dataService.selectedNetwork.mappings.nodesContinuous.length);
      case 'np':
        return String(this.dataService.selectedNetwork.mappings.nodesPassthrough.length);
      case 'ed':
        return String(this.dataService.findDiscreteMappingForProperty(this.dataService.selectedNetwork.mappings.edgesDiscrete, this.propertyToMap))
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
        value: this.propertyToMap.min || null,
        isEditable: false
      },
      {
        propertyValue: null,
        value: this.propertyToMap.max || null,
        isEditable: false
      },
    ];
    this.mappingContinuous.thresholds = this.thresholds.map(a => a.value);
    this.mappingContinuous.equals = this.thresholds.map(a => a.propertyValue);
  }


  /**
   * Prefills the continuous mapping
   *
   * @param mapping the mapping to be edited
   */
  prefillContinuousMapping(mapping: any): void {
    // this.continuousThresholds = [];
    // this.styleProperty = mapping.title[0];
    //
    // if (mapping.chartValid) {
    //
    //   const mappedProperty = this.getMappedProperty(mapping);
    //
    //   for (const label of mapping.chart.lineChartLabels) {
    //     if (label !== '') {
    //       const thresholdObj: NeThresholdMap = {
    //         value: Number(label),
    //         propertyValue: mapping.chart.lineChartData[0].data[mapping.chart.lineChartLabels.indexOf(label)],
    //         isEditable: label === mappedProperty.min || label === mappedProperty.max
    //       };
    //       this.continuousThresholds.push(thresholdObj);
    //     }
    //   }
    //   this.continuousMapping = {
    //     defaultGreater: mapping.chart.lineChartData[0].data[mapping.chart.lineChartData[0].data.length - 1],
    //     defaultLower: mapping.chart.lineChartData[0].data[0],
    //     breakpoints: this.continuousThresholds,
    //     cssKey: this.styleProperty,
    //     mappedProperty
    //   };
    //
    // } else if (mapping.gradientValid) {
    //
    //   const mappedProperty = this.getMappedProperty(mapping);
    //
    //   for (const color of mapping.colorGradient) {
    //     if (color.offset !== '-1' && color.offset !== '101') {
    //       const thresholdObj: NeThresholdMap = {
    //         value: Number(color.numericThreshold),
    //         propertyValue: color.color,
    //         isEditable: color.numericThreshold === mappedProperty.min || color.numericThreshold === mappedProperty.max
    //       };
    //       this.continuousThresholds.push(thresholdObj);
    //     }
    //   }
    //   this.continuousMapping = {
    //     defaultGreater: mapping.colorGradient[mapping.colorGradient.length - 1].color,
    //     defaultLower: mapping.colorGradient[0].color,
    //     breakpoints: this.continuousThresholds,
    //     cssKey: this.styleProperty,
    //     mappedProperty
    //   };
    //
    // }
  }

  /**
   * Returns the property which is mapped by this mapping, either discrete or continuous
   * @todo refactor to use a specific type for continuous mappings
   * @param mapping
   * @private
   */
  private getMappedProperty(mapping: any): NeAspect {
    if (this.typeHint.nc) {
      return this.dataService.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === mapping.title[1]);
    } else if (this.typeHint.ec) {
      return this.dataService.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === mapping.title[1]);
    }
  }

  /**
   * Prefills discrete mapping
   *
   * @param mapping the mapping to be edited
   * @param propertyId id to the style property within the mapping which is to be edited
   * @param isNode true if the selected mapping belongs to nodes
   */
  prefillDiscreteMapping(mapping: NeMappingDiscrete[], propertyId: number, isNode: boolean): void {
    // console.log(mapping, propertyId);
    // this.discreteMapping = [];
    // this.styleProperty = mapping.styleMap[propertyId].cssKey;
    // const correspondingAkv = (isNode
    //   ? this.dataService.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === mapping.col)
    //   : this.dataService.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === mapping.col));
    //
    // for (const selector of mapping.styleMap[propertyId].selectors) {
    //   const mapObj: NeMappingsDefinition = {
    //     col: UtilityService.utilCleanString(mapping.col),
    //     colHR: mapping.col,
    //     is: UtilityService.utilCleanString(mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)]),
    //     isHR: mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)],
    //     selector,
    //     cssKey: this.styleProperty,
    //     cssValue: mapping.styleMap[propertyId].cssValues[mapping.styleMap[propertyId].selectors.indexOf(selector)],
    //     priority: UtilityService.utilFindPriorityBySelector(selector)
    //   };
    //   this.discreteMapping.push(mapObj);
    // }
    //
    // for (const val of correspondingAkv.values) {
    //   if (!this.discreteMapping.map(x => x.isHR).includes(val)) {
    //     const col = UtilityService.utilCleanString(correspondingAkv.name);
    //     const is = UtilityService.utilCleanString(val);
    //     const selector = (isNode ? '.node_' : '.edge_') + col + '_' + is;
    //     const obj: NeMappingsDefinition = {
    //       col,
    //       colHR: correspondingAkv.name,
    //       is,
    //       isHR: val,
    //       selector,
    //       cssKey: this.styleProperty,
    //       cssValue: '',
    //       priority: UtilityService.utilFindPriorityBySelector(selector)
    //     };
    //     this.discreteMapping.push(obj);
    //   }
    // }

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
}

