import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {NeNetwork} from '../../models/ne-network';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {faLightbulb, faPalette} from '@fortawesome/free-solid-svg-icons';
import {ChartDataSets} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {NeColorGradient} from '../../models/ne-color-gradient';

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

  lookup: string;
  attribute: string;

  showAllForNodes = false;
  showAllForEdges = false;
  showAttributesFor = '-1';
  showComparison = false;
  showChart = false;
  showColorGradient = false;
  gradientBackground = '';
  index = '';

  public lineChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  public lineChartLabels: Label[] = [''];
  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(255,0,0,0.4)',
    }
  ];
  public lineChartOptions;

  highlightNodes = '#0000ff';
  highlightEdges = '#0000ff';
  highlightDuration = 2000;

  showLabels = false;

  private readonly subscription: Subscription;

  constructor(public dataService: DataService,
              private route: ActivatedRoute,
              public graphService: GraphService) {

    this.subscription = this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
    });
  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
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

  displayMapping(chart: any = null, colorGradient: NeColorGradient[] = [], index: string): void {
    this.index = index;
    if (chart !== null) {
      this.attribute = chart.lineChartOptions.title.text[0];
      this.lookup = chart.lineChartOptions.title.text[1];
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
      this.showComparison = false;
      this.showChart = true;

    } else if (colorGradient.length > 0) {

      this.lookup = colorGradient[0].title[0];
      this.attribute = colorGradient[0].title[1];
      let color = 'linear-gradient(90deg, ';
      const tmp = [];

      for (const gradient of colorGradient) {
        if (gradient.offset !== '-1' && gradient.offset !== '101') {
          tmp.push(gradient.color.concat(' '.concat(gradient.offset)));
        }
      }

      color = color.concat(tmp.join(', '));
      color = color.concat(')');

      this.gradientBackground = colorGradient[0].color + ' ' + color;

      this.showComparison = false;
      this.showChart = false;
      this.showColorGradient = true;
    }
  }

  showAttributesForId(id: string): void {
    this.showAttributesFor = id;
  }

  showAllNodesAttributes(show: boolean): void {
    this.showAllForNodes = show;
  }

  showAllEdgesAttributes(show: boolean): void {
    this.showAllForEdges = show;
  }

  hidePreviews(): void {
    this.showColorGradient = false;
    this.showChart = false;
  }
}
