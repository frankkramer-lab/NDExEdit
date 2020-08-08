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
import {ParseService} from '../../services/parse.service';
import {NeContinuousThresholds} from '../../models/ne-continuous-thresholds';
import {NeThresholdMap} from '../../models/ne-threshold-map';
import {NeGroupedMappingsDiscrete} from '../../models/ne-grouped-mappings-discrete';

@Component({
  selector: 'app-main-mappings-new',
  templateUrl: './main-mappings-new.component.html',
  styleUrls: ['./main-mappings-new.component.scss']
})

/**
 * Component responsible for creating new mappings
 */
export class MainMappingsNewComponent implements OnInit, OnDestroy {

  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
  faPalette = faPalette;
  faUndo = faUndo;
  faCheck = faCheck;
  faChartBar = faChartBar;
  faTimes = faTimes;
  faPlus = faPlus;
  faRoute = faRoute;

  selectedNetwork: NeNetwork;
  propertyToMap: NeAspect;

  mappingsType = {
    nd: false,
    nc: false,
    ed: false,
    ec: false
  };

  isEdit = false;
  validateAsColor = false;
  showColorPreviews = false;
  showDistribution = false;
  styleProperty: string;

  public barChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  public barChartLabels: Label[] = [''];

  public scatterChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  public scatterChartLabels: Label[] = [''];

  discreteMapping: NeMappingsDefinition[];
  continuousMapping: NeContinuousThresholds;
  continuousThresholds: NeThresholdMap[] = [];

  constructor(private route: ActivatedRoute,
              public dataService: DataService) {

    this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      const map = params.get('map');
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
        console.log(params);
        console.log(mapId);

        switch (mapType) {
          case 'nd':
            propertyId = params.get('propertyId');
            existingMapping = this.selectedNetwork.mappings.nodesDiscrete[mapId];
            this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes.find(x => x.name === existingMapping.classifier);
            this.styleProperty = existingMapping.styleMap[propertyId].cssKey;
            this.prefillDiscreteMapping(existingMapping, Number(propertyId));
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
            this.prefillDiscreteMapping(existingMapping, Number(propertyId));
            break;
          case 'ec':
            existingMapping = this.selectedNetwork.mappings.edgesContinuous[mapId];
            this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges.find(x => x.name === existingMapping.title[1]);
            this.styleProperty = existingMapping.title[0];
            this.prefillContinuousMapping(existingMapping);
            break;
        }
        console.log(existingMapping);
      }


    });

  }

  prefillContinuousMapping(mapping: any): void {
    this.continuousThresholds = [];
    this.validateAsColor = this.needsColorValidation(this.styleProperty);

    if (mapping.chartValid) {
      // use mapping.chart.lineChartLabels (without highest and lowest) as thresholds
      // use mapping.chart.lineChartData[0].data as values foreach label
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
        cssKey: this.styleProperty
      };

    } else if (mapping.gradientValid) {
      // use mapping.colorGradient as both values (.color) and thresholds (.numericThreshold) (without highest and lowest)
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
        cssKey: this.styleProperty
      };
    }
  }

  prefillDiscreteMapping(mapping: NeGroupedMappingsDiscrete, propertyId: number): void {
    this.discreteMapping = [];
    for (const selector of mapping.styleMap[propertyId].selectors) {
      const mapObj: NeMappingsDefinition = {
        col: mapping.classifier,
        colHR: mapping.classifier,
        is: mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        isHR: mapping.values[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        selector,
        cssKey: this.styleProperty,
        cssValue: mapping.styleMap[propertyId].cssValues[mapping.styleMap[propertyId].selectors.indexOf(selector)],
        priority: null
      };
      this.discreteMapping.push(mapObj);
    }
  }


  ngOnInit(): void {
    this.barChartData = this.propertyToMap.chartDiscreteDistribution.chartData;
    this.barChartLabels = this.propertyToMap.chartDiscreteDistribution.chartLabels;
    this.scatterChartData = this.propertyToMap.chartContinuousDistribution.chartData;
  }

  ngOnDestroy(): void {
    this.showDistribution = false;
    this.barChartData = [];
    this.barChartLabels = [];
    this.scatterChartData = [];
    this.continuousThresholds = [];
  }

  toggleDistributionChart(toggle: boolean): void {
    this.showDistribution = toggle;
  }

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

  colorPreview(): void {
    this.showColorPreviews = true;
  }

  private initDiscreteMapping(baseType: string): void {
    for (const value of this.propertyToMap.values) {
      const selector = '.' + (baseType.startsWith('n') ? 'node' : 'edge') + '_' + ParseService.utilCleanString(this.propertyToMap.name) + '_' + ParseService.utilCleanString(value);
      const tmp: NeMappingsDefinition = {
        col: ParseService.utilCleanString(this.propertyToMap.name),
        colHR: this.propertyToMap.name,
        is: ParseService.utilCleanString(value),
        isHR: value,
        selector,
        cssKey: this.styleProperty,
        cssValue: null,
        priority: ParseService.findPriorityBySelector(selector),
        datatype: null
      };
      this.discreteMapping.push(tmp);
    }
  }

  private initContinuousMapping(): void {
    this.continuousMapping.defaultGreater = '';
    this.continuousMapping.defaultLower = '';
    this.continuousMapping.breakpoints = this.continuousThresholds;
    this.continuousMapping.cssKey = '';
  }


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
  }

  /**
   * Submits a new continuous mapping, adds CSS property to color properties managed in {@link GraphService}
   */
  submitNewContinuousMapping(): void {
    if (this.validateAsColor && !this.dataService.colorProperties.includes(this.styleProperty)) {
      this.dataService.colorProperties.push(this.styleProperty);
    }
    this.continuousMapping.cssKey = this.styleProperty;
    this.continuousMapping.mappedProperty = this.propertyToMap;
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.filter(x => x.value !== null);
    this.continuousMapping.breakpoints = this.continuousMapping.breakpoints.sort((a, b) => (a.value < b.value ? -1 : 1));

    this.dataService.addMappingContinuous(this.selectedNetwork.id, this.mappingsType.nc, this.continuousMapping);
  }

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


  colorValidation(b: boolean): void {
    this.validateAsColor = b;
  }

  addNewThreshold(): void {
    this.continuousThresholds.push({
      value: null,
      propertyValue: ''
    });
  }

  // todo
  redirect(): void {
    console.log('redirect');
  }
}
