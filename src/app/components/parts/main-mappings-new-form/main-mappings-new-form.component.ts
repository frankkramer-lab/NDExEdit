import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {NeThresholdMap} from '../../../models/ne-threshold-map';
import {NeContinuousThresholds} from '../../../models/ne-continuous-thresholds';
import {faCheck, faPlus, faTimes, faUndo} from '@fortawesome/free-solid-svg-icons';
import {UtilityService} from '../../../services/utility.service';
import {NeMappingsType} from '../../../models/ne-mappings-type';
import {NeAspect} from '../../../models/ne-aspect';
import {NeMappingsDefinition} from '../../../models/ne-mappings-definition';
import {NeGroupedMappingsDiscrete} from '../../../models/ne-grouped-mappings-discrete';

@Component({
  selector: 'app-main-mappings-new-form',
  templateUrl: './main-mappings-new-form.component.html',
  styleUrls: ['./main-mappings-new-form.component.scss']
})
export class MainMappingsNewFormComponent implements OnInit, OnDestroy {

  faPlus = faPlus;

  faTimes = faTimes;

  faUndo = faUndo;

  faCheck = faCheck;

  styleProperty: string;

  mapType: string;

  @Output() stylePropertyEmitter = new EventEmitter<string>();

  @Input() isEdit!: boolean;

  @Input() typeHint!: NeMappingsType;

  @Input() propertyPointer: number;

  @Input() propertyToMap: NeAspect;

  @Input() mapId: string;

  /**
   * Thresholds that belong to this {@link MainMappingsNewComponent#continuousMapping}
   */
  continuousThresholds: NeThresholdMap[] = [];

  /**
   * Newly created or existing continuous mapping to be edited
   */
  continuousMapping: NeContinuousThresholds;

  /**
   * Newly created or existing discrete mapping to be edited
   */
  discreteMapping: NeMappingsDefinition[];

  /**
   * True, if all properties are available for loading
   */
  isInitialized: boolean;

  constructor(public dataService: DataService, public utilityService: UtilityService) {
  }

  ngOnInit(): void {
    this.mapType = this.utilityService.utilGetTypeLiteralByTypeHint(this.typeHint);

    if (!this.isEdit) {
      if (this.typeHint.ec || this.typeHint.nc) {
        this.continuousMapping = {};
        this.initContinuousMapping();
      } else {
        this.discreteMapping = [];
        this.initDiscreteMapping(this.typeHint);
      }
    } else {
      let existingMapping;
      if (this.typeHint.nd) {
        existingMapping = this.dataService.networkSelected.mappings.nodesDiscrete[this.mapId];
        this.prefillDiscreteMapping(existingMapping, this.propertyPointer, true);
      } else if (this.typeHint.ed) {
        existingMapping = this.dataService.networkSelected.mappings.edgesDiscrete[this.mapId];
        this.prefillDiscreteMapping(existingMapping, this.propertyPointer, false);
      } else if (this.typeHint.ec) {
        existingMapping = this.dataService.networkSelected.mappings.edgesContinuous[this.mapId];
        this.prefillContinuousMapping(existingMapping);
      } else if (this.typeHint.nc) {
        existingMapping = this.dataService.networkSelected.mappings.nodesContinuous[this.mapId];
        this.prefillContinuousMapping(existingMapping);
      }
    }
    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    this.continuousThresholds = [];
    this.continuousMapping = null;
    this.discreteMapping = null;
    this.styleProperty = null;
    this.propertyPointer = null;
    this.isInitialized = false;
    this.typeHint = null;
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
    this.continuousThresholds.push({
      value: null,
      propertyValue: '',
      isEditable: true
    });
  }

  /**
   * Clears all inputs for a mapping except the non-manipulatables of a continuous mapping
   */
  clearAllInputs(): void {
    if (this.discreteMapping) {
      for (const entry of this.discreteMapping) {
        entry.cssValue = '';
      }
    }

    if (this.continuousMapping) {
      this.continuousMapping.defaultLower = '';
      this.continuousMapping.defaultGreater = '';
      for (const breakpoint of this.continuousMapping.breakpoints) {
        if (breakpoint.isEditable) {
          breakpoint.value = null;
        }
        breakpoint.propertyValue = '';
      }
    }
  }

  /**
   * Submits a new continuous mapping
   */
  submitNewContinuousMapping(): void {
    this.continuousMapping.cssKey = this.styleProperty;
    this.continuousMapping.mappedProperty = this.propertyToMap;
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.filter(x => x.value !== null);
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.sort((a, b) => (a.value < b.value ? -1 : 1));
    this.continuousMapping.defaultGreater = this.continuousMapping.breakpoints[this.continuousMapping.breakpoints.length - 1].propertyValue;
    this.continuousMapping.defaultLower = this.continuousMapping.breakpoints[0].propertyValue;

    // this.dataService.addMappingContinuous(this.dataService.networkSelected.id, this.typeHint.nc, this.continuousMapping);

  }

  /**
   * Submits a new discrete mapping, adds CSS property to color properties managed in {@link GraphService}
   */
  submitNewDiscreteMapping(): void {

    for (const entry of this.discreteMapping) {
      entry.cssKey = this.styleProperty.trim();
      if (entry.cssValue) {
        entry.cssValue = entry.cssValue.trim();
      } else {
        entry.cssValue = '';
      }
    }
    // this.dataService.addMappingDiscrete(this.dataService.networkSelected.id, this.typeHint.nd, this.discreteMapping);

  }

  /**
   * Submits a new mapping and distributes the requests between discrete and continuous mappings
   * @param isDiscrete
   */
  submitNewMapping(isDiscrete: boolean): void {

    if (this.needsColorValidation(this.styleProperty) && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    } else if (!this.needsColorValidation(this.styleProperty) && this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties = this.dataService.colorProperties.filter(x => x !== this.styleProperty);
    }
    if (isDiscrete) {
      this.submitNewDiscreteMapping();
    } else {
      this.submitNewContinuousMapping();
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
        for (const nodeMap of this.dataService.networkSelected.mappings.nodesDiscrete) {
          // if (nodeMap.classifier === this.propertyToMap.name) {
          //   return String(this.dataService.networkSelected.mappings.nodesDiscrete.indexOf(nodeMap));
          // }
        }
        return String(this.dataService.networkSelected.mappings.nodesDiscrete.length);
      case 'nc':
        return String(this.dataService.networkSelected.mappings.nodesContinuous.length);
      case 'ed':
        for (const edgeMap of this.dataService.networkSelected.mappings.edgesDiscrete) {
          // if (edgeMap.classifier === this.propertyToMap.name) {
          //   return String(this.dataService.networkSelected.mappings.edgesDiscrete.indexOf(edgeMap));
          // }
        }
        return String(this.dataService.networkSelected.mappings.edgesDiscrete.length);
      case 'ec':
        return String(this.dataService.networkSelected.mappings.edgesContinuous.length);
    }
    return String(-1);
  }

  /**
   * Initializes a continuous mapping
   * @private
   */
  private initContinuousMapping(): void {
    this.continuousThresholds.push({
        value: this.propertyToMap.min,
        propertyValue: '',
        isEditable: false
      },
      {
        value: this.propertyToMap.max,
        propertyValue: '',
        isEditable: false
      });
    this.continuousMapping.breakpoints = this.continuousThresholds;
    this.continuousMapping.cssKey = '';
  }

  /**
   * Initializes a discrete mapping
   * @param typeHint needed to build matching selectors for the classes which are later applied to the elements
   * @private
   */
  private initDiscreteMapping(typeHint: NeMappingsType): void {
    for (const value of this.propertyToMap.values) {
      const selector = '.' + ((typeHint.nd || typeHint.nc) ? 'node' : 'edge')
        + '_' + UtilityService.utilCleanString(this.propertyToMap.name)
        + '_' + UtilityService.utilCleanString(value);
      const tmp: NeMappingsDefinition = {
        col: UtilityService.utilCleanString(this.propertyToMap.name),
        colHR: this.propertyToMap.name,
        is: UtilityService.utilCleanString(value),
        isHR: value,
        selector,
        cssKey: this.styleProperty,
        cssValue: null,
        priority: UtilityService.utilFindPriorityBySelector(selector),
        datatype: null
      };
      this.discreteMapping.push(tmp);
    }
  }


  /**
   * Prefills the continuous mapping
   *
   * @param mapping the mapping to be edited
   */
  prefillContinuousMapping(mapping: any): void {
    this.continuousThresholds = [];
    this.styleProperty = mapping.title[0];

    if (mapping.chartValid) {

      const mappedProperty = this.getMappedProperty(mapping);

      for (const label of mapping.chart.lineChartLabels) {
        if (label !== '') {
          const thresholdObj: NeThresholdMap = {
            value: Number(label),
            propertyValue: mapping.chart.lineChartData[0].data[mapping.chart.lineChartLabels.indexOf(label)],
            isEditable: label === mappedProperty.min || label === mappedProperty.max
          };
          this.continuousThresholds.push(thresholdObj);
        }
      }
      this.continuousMapping = {
        defaultGreater: mapping.chart.lineChartData[0].data[mapping.chart.lineChartData[0].data.length - 1],
        defaultLower: mapping.chart.lineChartData[0].data[0],
        breakpoints: this.continuousThresholds,
        cssKey: this.styleProperty,
        mappedProperty
      };

    } else if (mapping.gradientValid) {

      const mappedProperty = this.getMappedProperty(mapping);

      for (const color of mapping.colorGradient) {
        if (color.offset !== '-1' && color.offset !== '101') {
          const thresholdObj: NeThresholdMap = {
            value: Number(color.numericThreshold),
            propertyValue: color.color,
            isEditable: color.numericThreshold === mappedProperty.min || color.numericThreshold === mappedProperty.max
          };
          this.continuousThresholds.push(thresholdObj);
        }
      }
      this.continuousMapping = {
        defaultGreater: mapping.colorGradient[mapping.colorGradient.length - 1].color,
        defaultLower: mapping.colorGradient[0].color,
        breakpoints: this.continuousThresholds,
        cssKey: this.styleProperty,
        mappedProperty
      };

    }
  }

  /**
   * Returns the property which is mapped by this mapping, either discrete or continuous
   * @todo refactor to use a specific type for continuous mappings
   * @param mapping
   * @private
   */
  private getMappedProperty(mapping: any): NeAspect {
    if (this.typeHint.nc) {
      return this.dataService.networkSelected.aspectKeyValuesNodes.find(x => x.name === mapping.title[1]);
    } else if (this.typeHint.ec) {
      return this.dataService.networkSelected.aspectKeyValuesEdges.find(x => x.name === mapping.title[1]);
    }
  }

  /**
   * Prefills discrete mapping
   *
   * @param mapping the mapping to be edited
   * @param propertyId id to the style property within the mapping which is to be edited
   * @param isNode true if the selected mapping belongs to nodes
   */
  prefillDiscreteMapping(mapping: NeGroupedMappingsDiscrete, propertyId: number, isNode: boolean): void {
    console.log(mapping, propertyId);
    this.discreteMapping = [];
    this.styleProperty = mapping.styleMap[propertyId].cssKey;
    const correspondingAkv = (isNode
      ? this.dataService.networkSelected.aspectKeyValuesNodes.find(x => x.name === mapping.classifier)
      : this.dataService.networkSelected.aspectKeyValuesEdges.find(x => x.name === mapping.classifier));

    for (const selector of mapping.styleMap[propertyId].selectors) {
      const mapObj: NeMappingsDefinition = {
        col: UtilityService.utilCleanString(mapping.classifier),
        colHR: mapping.classifier,
        is: UtilityService.utilCleanString(mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)]),
        isHR: mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        selector,
        cssKey: this.styleProperty,
        cssValue: mapping.styleMap[propertyId].cssValues[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        priority: UtilityService.utilFindPriorityBySelector(selector)
      };
      this.discreteMapping.push(mapObj);
    }

    for (const val of correspondingAkv.values) {
      if (!this.discreteMapping.map(x => x.isHR).includes(val)) {
        const col = UtilityService.utilCleanString(correspondingAkv.name);
        const is = UtilityService.utilCleanString(val);
        const selector = (isNode ? '.node_' : '.edge_') + col + '_' + is;
        const obj: NeMappingsDefinition = {
          col,
          colHR: correspondingAkv.name,
          is,
          isHR: val,
          selector,
          cssKey: this.styleProperty,
          cssValue: '',
          priority: UtilityService.utilFindPriorityBySelector(selector)
        };
        this.discreteMapping.push(obj);
      }
    }

  }

  /**
   * Emits the new styleProperty to parent
   */
  emitStyleProperty(): void {
    this.stylePropertyEmitter.emit(this.styleProperty);
  }

}

