import {Component, OnDestroy, OnInit} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowLeft, faArrowRight, faChartBar, faCheck, faPalette, faUndo} from '@fortawesome/free-solid-svg-icons';
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

  propertyToMap: NeAspect;
  selectedNetwork: NeNetwork;

  mappingsType = {
    nd: false,
    nc: false,
    ed: false,
    ec: false
  };

  showColorPreviews = false;
  showDistribution = false;
  styleProperty: string;
  nodesColorProperties: string[] = ['background-color', 'border-color'];
  edgesColorProperties: string[] = ['line-color', 'target-arrow-color', 'source-arrow-color'];

  public barChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  public barChartLabels: Label[] = [''];

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
  }

  ngOnDestroy(): void {
    this.barChartData = [];
    this.barChartLabels = [];
  }

  toggleDistributionChart(toggle: boolean): void {
    this.showDistribution = toggle;
  }

  needsColorValidation(property: string): boolean {
    return (this.nodesColorProperties.includes(property) || this.edgesColorProperties.includes(property));
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
    console.log(this.discreteMapping);
  }
}
