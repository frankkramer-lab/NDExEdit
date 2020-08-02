import {Component, OnDestroy, OnInit} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowLeft, faArrowRight, faChartBar, faCheck, faPalette, faTimes, faUndo} from '@fortawesome/free-solid-svg-icons';
import {NeMappingsDefinition} from '../../models/ne-mappings-definition';
import {NeAspect} from '../../models/ne-aspect';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {ParseService} from '../../services/parse.service';

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

  selectedNetwork: NeNetwork;
  propertyToMap: NeAspect;

  mappingsType = {
    nd: false,
    nc: false,
    ed: false,
    ec: false
  };

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

  constructor(private route: ActivatedRoute,
              public dataService: DataService) {

    this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      const propertyPointer = params.get('property');
      switch (params.get('map')) {
        case 'nd':
          this.mappingsType.nd = true;
          this.mappingsType.nc = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes[propertyPointer];
          break;
        case 'nc':
          this.mappingsType.nc = true;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes[propertyPointer];
          break;
        case 'ed':
          this.mappingsType.ed = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ec = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges[propertyPointer];
          break;
        case 'ec':
          this.mappingsType.ec = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges[propertyPointer];
          break;

      }
      this.discreteMapping = [];
      this.initMapping(params.get('map'));

    });

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
  }

  toggleDistributionChart(toggle: boolean): void {
    this.showDistribution = toggle;
  }

  needsColorValidation(property: string): boolean {
    return (this.dataService.colorProperties.includes(property));
  }

  colorPreview(): void {
    this.showColorPreviews = true;
  }

  private initMapping(baseType: string): void {
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

  clearAllInputs(): void {
    for (const entry of this.discreteMapping) {
      entry.cssValue = '';
    }
  }

  /**
   * Submits a new mapping
   */
  submitNewMapping(): void {
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

  getNextIdForMappingType(mappingType: string): string {
    switch (mappingType) {
      case 'nd':
        return this.selectedNetwork.mappings.nodesDiscrete.length;
      case 'nc':
        return this.selectedNetwork.mappings.nodesContinuous.length;
      case 'ed':
        return this.selectedNetwork.mappings.edgesDiscrete.length;
      case 'ec':
        return this.selectedNetwork.mappings.edgesContinuous.length;
    }
  }

  colorValidation(b: boolean): void {
    this.validateAsColor = b;
  }
}
