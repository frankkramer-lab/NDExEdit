import {AfterViewInit, Component, OnDestroy, Renderer2} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {NeNetwork} from '../../models/ne-network';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {faLightbulb, faPalette} from '@fortawesome/free-solid-svg-icons';
import {ChartDataSets} from 'chart.js';
import {Color, Label} from 'ng2-charts';

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})

/**
 * Component responsible for graph editing functionality
 */
export class SidebarEditComponent implements AfterViewInit, OnDestroy {

  faPalette = faPalette;
  faLightbulb = faLightbulb;

  selectedNetwork: NeNetwork;
  isInitialized = false;

  showChart = false;
  showColorGradient = false;
  chartCanvas: any;
  public lineChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  public lineChartLabels: Label[] = [''];
  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(255,0,0,0.4)',
    }
  ];
  public lineChartOptions = {
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          id: 'y-axis-1',
        },
        {
          type: 'linear',
          display: true,
          position: 'right',
          id: 'y-axis-2',
        }
      ]
    }
  };

  highlightNodes = '#0000ff';
  highlightEdges = '#0000ff';
  highlightDuration = 2000;

  showLabels = false;

  private readonly subscription: Subscription;

  constructor(public dataService: DataService,
              private route: ActivatedRoute,
              public graphService: GraphService,
              private renderer: Renderer2) {
    this.subscription = this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
    });

    if (this.isInitialized) {
      // this.renderChart();
    }

  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
    // this.renderChart();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleLabels(show: boolean): void {
    this.graphService.toggleLabels(show);
    this.showLabels = show;
  }

  private renderChart(): void {

    if (this.selectedNetwork) {
      const chartDetails = this.selectedNetwork.mappings.edgesContinuous;
      this.lineChartData = chartDetails.lineChartData;
      this.lineChartLabels = chartDetails.lineChartLabels;
      this.lineChartColors = chartDetails.lineChartColors;
      this.lineChartOptions = chartDetails.lineChartOptions;
      this.chartCanvas = this.renderer.selectRootElement('#mappingsChart');

    }

  }

  displayMapping(displayChart: any, chart: any): void {
    if (displayChart) {
      const randR = Math.random() % 255;
      const randG = Math.random() % 255;
      const randB = Math.random() % 255;

      this.lineChartData = chart.lineChartData;
      this.lineChartLabels = chart.lineChartLabels;
      this.lineChartColors = [{
        backgroundColor: 'rgba(255,0,0,0.3)',
        borderColor: 'red',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      }];
      this.lineChartOptions = chart.lineChartOptions;
      this.showColorGradient = false;
      this.showChart = true;
    } else {
      // todo
      this.showChart = false;
      this.showColorGradient = true;
    }
  }
}
