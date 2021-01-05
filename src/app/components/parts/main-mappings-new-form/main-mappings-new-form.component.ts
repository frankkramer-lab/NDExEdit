import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {NeThresholdMap} from '../../../models/ne-threshold-map';
import {NeContinuousThresholds} from '../../../models/ne-continuous-thresholds';
import {faCheck, faPlus, faTimes, faUndo} from '@fortawesome/free-solid-svg-icons';
import {UtilityService} from "../../../services/utility.service";
import {NeMappingsType} from "../../../models/ne-mappings-type";
import {NeAspect} from "../../../models/ne-aspect";
import {NeMappingsDefinition} from "../../../models/ne-mappings-definition";

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

  @Input() styleProperty: string;

  @Input() isEdit: boolean;

  @Input() mapType: string;

  @Input() propertyPointer: number;

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
   * Property for which a mapping is to be added
   */
  propertyToMap: NeAspect;

  /**
   * Clean typing for types of mapping
   */
  typeHint: NeMappingsType;

  constructor(public dataService: DataService, public utilityService: UtilityService) {
  }

  ngOnInit(): void {
    this.typeHint = this.utilityService.utilGetTypeHintByString(this.mapType);
    let availableAttributes = [];

    if (this.typeHint.ec || this.typeHint.ed) {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesEdges;
    } else {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesNodes;
    }

    if (this.typeHint.ec || this.typeHint.nc) {
      availableAttributes = availableAttributes
        .filter(a => a.datatype && (a.datatype === 'integer' || a.datatype === 'float' || a.datatype === 'double'));
    } else {
      availableAttributes = availableAttributes
        .filter(a => !a.datatype || a.datatype === 'integer' || a.datatype === 'string' || a.datatype === null);
    }

    this.propertyToMap = availableAttributes[this.propertyPointer];

    if (this.typeHint.ec || this.typeHint.nc) {
      this.continuousMapping = {};
      this.initContinuousMapping();
    } else {
      this.discreteMapping = [];
      this.initDiscreteMapping(this.typeHint);
    }
  }

  ngOnDestroy(): void {
    this.continuousThresholds = [];
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
    // if (Array.isArray(property)) {
    //   for (const p of property) {
    //     if (!this.dataService.colorProperties.includes(p)) {
    //       return false;
    //     }
    //   }
    //   return true;
    // }
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

    if (this.needsColorValidation(this.styleProperty) && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    } else if (!this.needsColorValidation(this.styleProperty) && this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties = this.dataService.colorProperties.filter(x => x !== this.styleProperty);
    }

    this.continuousMapping.cssKey = this.styleProperty;
    this.continuousMapping.mappedProperty = this.propertyToMap;
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.filter(x => x.value !== null);
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.sort((a, b) => (a.value < b.value ? -1 : 1));
    this.continuousMapping.defaultGreater = this.continuousMapping.breakpoints[this.continuousMapping.breakpoints.length - 1].propertyValue;
    this.continuousMapping.defaultLower = this.continuousMapping.breakpoints[0].propertyValue;

    this.dataService.addMappingContinuous(this.dataService.networkSelected.id, this.typeHint.nc, this.continuousMapping);

  }

  submitNewDiscreteMapping(): void {

    if (this.needsColorValidation(this.styleProperty) && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    } else if (!this.needsColorValidation(this.styleProperty) && this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties = this.dataService.colorProperties.filter(x => x !== this.styleProperty);
    }

    for (const entry of this.discreteMapping) {
      entry.cssKey = this.styleProperty.trim();
      if (entry.cssValue) {
        entry.cssValue = entry.cssValue.trim();
      } else {
        entry.cssValue = '';
      }
    }
    this.dataService.addMappingDiscrete(this.dataService.networkSelected.id, this.typeHint.nd, this.discreteMapping);

  }

  /**
   * TODO
   */
  editMapping(): void {
    console.log('STOP EDITING STUFF, nothing happening here');
    // if (this.mappingsType.nd || this.mappingsType.ed) {
    //   this.dataService.editMapping(this.dataService.networkSelected.id, this.discreteMapping, this.styleProperty, this.mappingsType);
    // } else {
    //   this.dataService.editMapping(this.dataService.networkSelected.id, this.continuousMapping, this.styleProperty, this.mappingsType);
    // }
  }

  /**
   * Fetches next ID for the current mapType
   */
  getNextIdForMappingType(): string {
    switch (this.mapType) {
      case 'nd':
        for (const nodeMap of this.dataService.networkSelected.mappings.nodesDiscrete) {
          if (nodeMap.classifier === this.propertyToMap.name) {
            return String(this.dataService.networkSelected.mappings.nodesDiscrete.indexOf(nodeMap));
          }
        }
        return String(this.dataService.networkSelected.mappings.nodesDiscrete.length);
      case 'nc':
        return String(this.dataService.networkSelected.mappings.nodesContinuous.length);
      case 'ed':
        for (const edgeMap of this.dataService.networkSelected.mappings.edgesDiscrete) {
          if (edgeMap.classifier === this.propertyToMap.name) {
            return String(this.dataService.networkSelected.mappings.edgesDiscrete.indexOf(edgeMap));
          }
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
}
