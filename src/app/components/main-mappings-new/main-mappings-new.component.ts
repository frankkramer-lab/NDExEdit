import {Component, OnDestroy, OnInit} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {
  faArrowLeft,
  faArrowRight,
  faChartBar,
  faCheck,
  faPalette,
  faPlus,
  faRoute,
  faTimes,
  faUndo
} from '@fortawesome/free-solid-svg-icons';
import {NeMappingsDefinition} from '../../models/ne-mappings-definition';
import {NeAspect} from '../../models/ne-aspect';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {NeContinuousThresholds} from '../../models/ne-continuous-thresholds';
import {NeThresholdMap} from '../../models/ne-threshold-map';
import {NeGroupedMappingsDiscrete} from '../../models/ne-grouped-mappings-discrete';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-main-mappings-new',
  templateUrl: './main-mappings-new.component.html',
  styleUrls: ['./main-mappings-new.component.scss']
})

/**
 * Component responsible for creating new mappings
 */
export class MainMappingsNewComponent implements OnInit, OnDestroy {

  /**
   * Icon: faArrowRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowRight = faArrowRight;

  /**
   * Icon: faArrowLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowLeft = faArrowLeft;

  /**
   * Icon: faPalette
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPalette = faPalette;

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
   * Icon: faChartBar
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChartBar = faChartBar;

  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;

  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;

  /**
   * Icon: faRoute
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRoute = faRoute;

  /**
   * The selected network of type {@link NeNetwork}
   */
  selectedNetwork: NeNetwork;

  /**
   * Property for which a mapping is to be added
   */
  propertyToMap: NeAspect;

  /**
   * Object containing the type of mapping to be added
   */
  mappingsType = {
    nd: false,
    nc: false,
    ed: false,
    ec: false
  };

  /**
   * Since the same component is used for adding a new and editing an existing mapping this boolean determines if
   * the component is used for editing
   */
  isEdit = false;

  /**
   * If a color property is entered into the input field this color validation boolean is set to true
   * and thus display of color previews is triggered (see {@link MainMappingsNewComponent#showColorPreviews})
   */
  validateAsColor = false;

  /**
   * Boolean if color previews are to display
   */
  showColorPreviews = false;

  /**
   * True if the distribution chart for the selected property is to be shown
   */
  showDistribution = false;

  /**
   * The CSS property for which the mapping is to be created or edited
   */
  styleProperty: string;

  /**
   * Distribution chart data for discrete aspects
   */
  public barChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];

  /**
   * Distribution chart labels for discrete aspects
   */
  public barChartLabels: Label[] = [''];

  /**
   * Distribution chart data for continuous aspects
   */
  public scatterChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];

  /**
   * Distribution chart labels for continuous aspects
   */
  public scatterChartLabels: Label[] = [''];

  /**
   * The new mapping's or the existing mapping's id
   */
  currentMappingId = '';

  /**
   * Newly created or existing discrete mapping to be edited
   */
  discreteMapping: NeMappingsDefinition[];

  /**
   * Newly created or existing continuous mapping to be edited
   */
  continuousMapping: NeContinuousThresholds;

  /**
   * Thresholds that belong to this {@link MainMappingsNewComponent#continuousMapping}
   */
  continuousThresholds: NeThresholdMap[] = [];

  /**
   * Existing mapping fetched from this selected network
   */
  mappingToEdit: any;

  /**
   * Determines by URL if this component is used for editing or creating a new mapping.
   * Thus prefills the properties used in the form or prepares the new creation.
   *
   * @param route Current route
   * @param dataService Service used to find the currently selected network
   */
  constructor(private route: ActivatedRoute,
              public dataService: DataService) {

    this.route.paramMap.subscribe(params => {
      const map = params.get('map');
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      this.currentMappingId = map.substring(2);
      const mapType = map.substring(0, 2);
      switch (mapType) {
        case 'nd':
          this.mappingsType.nd = true;
          this.mappingsType.nc = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          break;
        case 'nc':
          this.mappingsType.nc = true;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          break;
        case 'ed':
          this.mappingsType.ed = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ec = false;
          break;
        case 'ec':
          this.mappingsType.ec = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          break;

      }
      if (params.get('property')) {
        // create new
        const propertyPointer = params.get('property');

        if (mapType.startsWith('n')) {
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes[propertyPointer];
        } else {
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges[propertyPointer];
        }

        if (mapType.endsWith('c')) {
          this.continuousMapping = {};
          this.initContinuousMapping();
        } else {
          this.discreteMapping = [];
          this.initDiscreteMapping(mapType);
        }

      } else {
        // edit existing
        this.isEdit = true;
        let existingMapping;
        let propertyId;
        const mapId = map.substring(2);

        switch (mapType) {
          case 'nd':
            propertyId = params.get('propertyId');
            existingMapping = this.selectedNetwork.mappings.nodesDiscrete[mapId];
            this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === existingMapping.classifier);
            this.styleProperty = existingMapping.styleMap[propertyId].cssKey;
            this.prefillDiscreteMapping(existingMapping, Number(propertyId), true);
            break;
          case 'nc':
            existingMapping = this.selectedNetwork.mappings.nodesContinuous[mapId];
            this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === existingMapping.title[1]);
            this.styleProperty = existingMapping.title[0];
            this.prefillContinuousMapping(existingMapping);
            break;
          case 'ed':
            propertyId = params.get('propertyId');
            existingMapping = this.selectedNetwork.mappings.edgesDiscrete[mapId];
            this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === existingMapping.classifier);
            this.styleProperty = existingMapping.styleMap[propertyId].cssKey;
            this.prefillDiscreteMapping(existingMapping, Number(propertyId), false);
            break;
          case 'ec':
            existingMapping = this.selectedNetwork.mappings.edgesContinuous[mapId];
            this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === existingMapping.title[1]);
            this.styleProperty = existingMapping.title[0];
            this.prefillContinuousMapping(existingMapping);
            break;
        }
      }


    });

  }

  /**
   * Prefills the continuous mapping
   *
   * @param mapping the mapping to be edited
   */
  prefillContinuousMapping(mapping: any): void {
    this.continuousThresholds = [];
    this.validateAsColor = this.needsColorValidation(this.styleProperty);

    if (mapping.chartValid) {
      let mappedProperty;
      if (this.mappingsType.nc) {
        mappedProperty = this.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === mapping.title[1]);
      } else if (this.mappingsType.ec) {
        mappedProperty = this.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === mapping.title[1]);
      }

      for (const label of mapping.chart.lineChartLabels) {
        if (label !== '') {
          const thresholdObj: NeThresholdMap = {
            value: Number(label),
            propertyValue: mapping.chart.lineChartData[0].data[mapping.chart.lineChartLabels.indexOf(label)]
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

      let mappedProperty;
      if (this.mappingsType.nc) {
        mappedProperty = this.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === mapping.title[1]);
      } else if (this.mappingsType.ec) {
        mappedProperty = this.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === mapping.title[1]);
      }

      for (const color of mapping.colorGradient) {
        if (color.offset !== '-1' && color.offset !== '101') {
          const thresholdObj: NeThresholdMap = {
            value: Number(color.numericThreshold),
            propertyValue: color.color
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
   * Prefills discrete mapping
   *
   * @param mapping the mapping to be edited
   * @param propertyId id to the style property within the mapping which is to be edited
   * @param isNode true if the selected mapping belongs to nodes
   */
  prefillDiscreteMapping(mapping: NeGroupedMappingsDiscrete, propertyId: number, isNode: boolean): void {
    this.discreteMapping = [];
    const correspondingAkv = (isNode
      ? this.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === mapping.classifier)
      : this.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === mapping.classifier));

    for (const selector of mapping.styleMap[propertyId].selectors) {
      const mapObj: NeMappingsDefinition = {
        col: UtilityService.utilCleanString(mapping.classifier),
        colHR: mapping.classifier,
        is: UtilityService.utilCleanString(mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)]),
        isHR: mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        selector,
        cssKey: this.styleProperty,
        cssValue: mapping.styleMap[propertyId].cssValues[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        priority: UtilityService.utilfindPriorityBySelector(selector)
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
          priority: UtilityService.utilfindPriorityBySelector(selector)
        };
        this.discreteMapping.push(obj);
      }
    }

  }

  /**
   * Sets chart data for distribution of the selected aspect
   */
  ngOnInit(): void {
    this.barChartData = this.propertyToMap.chartDiscreteDistribution.chartData;
    this.barChartLabels = this.propertyToMap.chartDiscreteDistribution.chartLabels;
    this.scatterChartData = this.propertyToMap.chartContinuousDistribution.chartData;
  }

  /**
   * Resets chart data
   */
  ngOnDestroy(): void {
    this.showDistribution = false;
    this.barChartData = [];
    this.barChartLabels = [];
    this.scatterChartData = [];
    this.continuousThresholds = [];
  }

  /**
   * Toggles distribution chart
   * @param toggle new value
   */
  toggleDistributionChart(toggle: boolean): void {
    this.showDistribution = toggle;
  }

  /**
   * Checks if the given property is in the set of defined color properties (see {@link DataService#colorProperties})
   * @param property name of the entered property
   */
  needsColorValidation(property: string): boolean {
    if (Array.isArray(property)) {
      for (const p of property) {
        if (!this.dataService.colorProperties.includes(p)) {
          return false;
        }
      }
      return true;
    }
    return (this.dataService.colorProperties.includes(property));
  }

  /**
   * Basic init on creating a new discrete mapping
   *
   * @param baseType is either nd or ed and determines if a discrete node or edge mapping is to be added
   * @private
   */
  private initDiscreteMapping(baseType: string): void {
    for (const value of this.propertyToMap.values) {
      const selector = '.' + (baseType.startsWith('n') ? 'node' : 'edge') + '_' + UtilityService.utilCleanString(this.propertyToMap.name) + '_' + UtilityService.utilCleanString(value);
      const tmp: NeMappingsDefinition = {
        col: UtilityService.utilCleanString(this.propertyToMap.name),
        colHR: this.propertyToMap.name,
        is: UtilityService.utilCleanString(value),
        isHR: value,
        selector,
        cssKey: this.styleProperty,
        cssValue: null,
        priority: UtilityService.utilfindPriorityBySelector(selector),
        datatype: null
      };
      this.discreteMapping.push(tmp);
    }
  }

  /**
   * Basic init on creating a continuous mapping
   * @private
   */
  private initContinuousMapping(): void {
    this.continuousMapping.defaultGreater = '';
    this.continuousMapping.defaultLower = '';
    this.continuousMapping.breakpoints = this.continuousThresholds;
    this.continuousMapping.cssKey = '';
  }

  /**
   * Resets all input values within the form, except the color property
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
        breakpoint.value = null;
        breakpoint.propertyValue = '';
      }
    }
  }

  /**
   * Submits a new discrete mapping, adds CSS property to color properties managed in {@link GraphService}
   */
  submitNewDiscreteMapping(): void {

    if (this.validateAsColor && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    } else if (!this.validateAsColor && this.dataService.colorProperties.includes(this.styleProperty)) {
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
    this.dataService.addMappingDiscrete(this.selectedNetwork.id, this.mappingsType.nd, this.discreteMapping);
    console.log(this.dataService.colorProperties);

  }

  /**
   * Submits a new continuous mapping, adds CSS property to color properties managed in {@link GraphService}
   */
  submitNewContinuousMapping(): void {
    if (this.validateAsColor && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    } else if (!this.validateAsColor && this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties = this.dataService.colorProperties.filter(x => x !== this.styleProperty);
    }

    this.continuousMapping.cssKey = this.styleProperty;
    this.continuousMapping.mappedProperty = this.propertyToMap;
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.filter(x => x.value !== null);
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.sort((a, b) => (a.value < b.value ? -1 : 1));

    this.dataService.addMappingContinuous(this.selectedNetwork.id, this.mappingsType.nc, this.continuousMapping);
    console.log(this.dataService.colorProperties);
  }

  /**
   * Determines and returns the index of the next (in case of editing the current) mapping for this type
   *
   * @param mappingType type of mapping
   */
  getNextIdForMappingType(mappingType: string): string {

    switch (mappingType) {
      case 'nd':
        for (const nodeMap of this.selectedNetwork.mappings.nodesDiscrete) {
          if (nodeMap.classifier === this.propertyToMap.name) {
            return String(this.selectedNetwork.mappings.nodesDiscrete.indexOf(nodeMap));
          }
        }
        return String(this.selectedNetwork.mappings.nodesDiscrete.length);
      case 'nc':
        return this.selectedNetwork.mappings.nodesContinuous.length;
      case 'ed':
        for (const edgeMap of this.selectedNetwork.mappings.edgesDiscrete) {
          if (edgeMap.classifier === this.propertyToMap.name) {
            return String(this.selectedNetwork.mappings.edgesDiscrete.indexOf(edgeMap));
          }
        }
        return String(this.selectedNetwork.mappings.edgesDiscrete.length);
      case 'ec':
        return this.selectedNetwork.mappings.edgesContinuous.length;
    }
    return String(-1);
  }

  /**
   * If the user checks the color property checkbox the color validation is enforced
   * @param b
   */
  colorValidation(b: boolean): void {
    this.validateAsColor = b;
  }

  /**
   * Adds another threshold to be used within the continuous mapping
   */
  addNewThreshold(): void {
    this.continuousThresholds.push({
      value: null,
      propertyValue: ''
    });
  }

  /**
   * Is called on submission of and edited mapping and edits the continuous or discrete mapping
   * based on the previously set mappingstype
   */
  editMapping(): void {
    if (this.mappingsType.nd || this.mappingsType.ed) {
      this.dataService.editMapping(this.selectedNetwork.id, this.discreteMapping, this.styleProperty, this.mappingsType);
    } else {
      this.dataService.editMapping(this.selectedNetwork.id, this.continuousMapping, this.styleProperty, this.mappingsType);
    }
  }

}
