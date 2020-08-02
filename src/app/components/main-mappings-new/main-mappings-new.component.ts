import {AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowLeft, faArrowRight, faChartBar, faCheck, faPalette, faUndo} from '@fortawesome/free-solid-svg-icons';
import {NeMappingsDefinition} from '../../models/ne-mappings-definition';
import {NeAspect} from '../../models/ne-aspect';
import {ChartDataSets} from 'chart.js';
import {Color, Label} from 'ng2-charts';

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

  showDistribution = false;
  styleProperty: string;
  nodesColorProperties: string[] = ['background-color', 'border-color'];
  edgesColorProperties: string[] = ['line-color', 'target-arrow-color', 'source-arrow-color'];

  public barChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  public barChartLabels: Label[] = [''];
  public chartReady = false;

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

    });

  }

  ngOnInit(): void {
    this.barChartData = this.propertyToMap.chartDiscreteDistribution.chartData;
    this.barChartLabels = this.propertyToMap.chartDiscreteDistribution.chartLabels;
    this.chartReady = true;
  }

  ngOnDestroy(): void {
    this.chartReady = false;
    this.barChartData = [];
    this.barChartLabels = [];
  }

  toggleDistributionChart(toggle: boolean): void {
    this.showDistribution = toggle;
  }

}
