import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {faClone, faLightbulb, faPalette} from '@fortawesome/free-solid-svg-icons';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {NeColorGradient} from '../../models/ne-color-gradient';
import {MainMappingsComponent} from '../main-mappings/main-mappings.component';
import {MainMappingsNewComponent} from '../main-mappings-new/main-mappings-new.component';
import {NeChart} from '../../models/ne-chart';
import {NeChartType} from '../../models/ne-chart-type';
import {NeMappingDiscrete} from "../../models/ne-mapping-discrete";
import {NeMappingContinuous} from "../../models/ne-mapping-continuous";
import {UtilityService} from "../../services/utility.service";

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})

/**
 * Component responsible for graph editing functionality
 */
export class SidebarEditComponent implements AfterViewInit, OnDestroy {

  faClone = faClone;
  /**
   * Icon: faPalette
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPalette = faPalette;
  /**
   * Icon: faLightbulb
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faLightbulb = faLightbulb;
  /**
   * Toggles displaying the comparison of multiple selected elements
   */
  showComparison = false;
  /**
   * Toggles displaying the chart for numeric continuous mappings
   */
  showChart = false;
  /**
   * Toggles displaying the color gradient for color based continuous mappings
   */
  showColorGradient = false;
  /**
   * Toggles displaying the checkbox where the labels may be toggled
   */
  showLabelCheckbox = true;
  /**
   * Default value for continuous mappings if less than 100% range is covered
   */
  gradientBackground = '';
  /**
   * Indicates which type of mapping is to be displayed
   */
  index = '';
  /**
   * Selected mapping matching the {@link index}
   */
  mapping: NeMappingDiscrete | NeMappingContinuous;
  /**
   * chart data used to display numeric continuous mapping, initialized with default values.
   * See {@link ParseService#buildChartData} for more details
   */
  lineChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];
  /**
   * chart labels used to display numeric continuous mapping
   * See {@link ParseService#buildChartData} for more details
   */
  lineChartLabels: Label[] = [''];
  /**
   * chart options used to display numeric continuous mapping
   * See {@link ParseService#buildChartData} for more details
   */
  lineChartOptions;

  /**
   * LineChartObject
   */
  lineChartObject: NeChart;

  /**
   * Default color for highlighting a lost node
   */
  highlightNodes = '#ff0000';
  /**
   * Default color for highlighting a lost edge
   */
  highlightEdges = '#ff0000';
  /**
   * Default duration for highlight a lost element, in milliseconds
   */
  highlightDuration = 2000;
  /**
   * Ensures that only a graph is rendered if the id is specified within the URL
   * @private
   */
  private readonly routerSubscription: Subscription;
  /**
   * Subscription to the event emitter of the component {@link MainMappingsComponent}
   * @private
   */
  private mappingsSubscription: Subscription;
  /**
   * Subscription to the event emitter of the component {@link MainMappingsNewComponent}
   * @private
   */
  private mappingsNewSubscription: Subscription;
  /**
   * Checks if the view is initialized
   * @private
   */
  private isInitialized = false;

  /**
   * Type of chart to be displayed
   */
  chartType: NeChartType = {
    line: true,
    bar: false
  };

  /**
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param dataService Service to read and write globally accessible data
   * @param route Service to read URL
   * @param graphService Service for graph manipulations
   */
  constructor(
    public dataService: DataService,
    private route: ActivatedRoute,
    public graphService: GraphService,
    private utilityService: UtilityService
  ) {

    this.routerSubscription = this.route.paramMap.subscribe(params => {
      const networkId = params.get('id');
      if (networkId) {
        dataService.selectNetwork(Number(networkId));
      }
    });

    this.mappingsSubscription = MainMappingsComponent.mappingsEmitter.subscribe(data => {
      this.handleViewChanges(data);
    });

    this.mappingsNewSubscription = MainMappingsNewComponent.mappingsNewEmitter.subscribe(data => {
      this.handleViewChanges(data);
    });
  }

  /**
   * Sets initialized status, toggles labels with respect to network information
   * and initializes the color highlighting properties to be used for this specific network
   */
  ngAfterViewInit(): void {
    this.isInitialized = true;
  }

  /**
   * Unsets initialized status and restores default values
   */
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.showComparison = false;
    this.showChart = false;
    this.showColorGradient = false;
    this.showLabelCheckbox = true;
    this.gradientBackground = '';
    this.index = '';
    this.graphService.selectedElements.nodes = [];
    this.graphService.selectedElements.edges = [];
    this.mapping = null;

    if (this.mappingsSubscription) {
      this.mappingsSubscription.unsubscribe();
    }
    if (this.mappingsNewSubscription) {
      this.mappingsNewSubscription.unsubscribe();
    }
  }

  /**
   * Handles the view toggles for the sidebar
   *
   * @param data
   */
  handleViewChanges(data: any): void {
    if (data.showGradient !== null) {
      this.showColorGradient = data.showGradient;
    }
    if (data.showLabelCheckbox !== null) {
      this.showLabelCheckbox = data.showLabelCheckbox;
    }
    if (data.showChart !== null) {
      this.showChart = data.showChart;
    }
    if (data.clearSelection !== null) {
      this.graphService.selectedElements.nodes = [];
      this.graphService.selectedElements.edges = [];
    }
  }

  /**
   * Toggles labels by using a specific CSS class which overrides the values of the labels
   * @param show Determines if labels are to be displayed
   */
  toggleLabels(show: boolean): void {
    this.graphService.toggleLabels(show);
    this.dataService.networkSelected.showLabels = show;
  }

  /**
   * Displays details to a selected mapping within the sidebar
   * @param chart data for continuous mapping with numeric values; see {@link ParseService#buildChartData}
   * @param colorGradient data for continuous mapping with color based values; see {@link ParseService#buildColorGradient}
   * @param index type of mapping
   */
  displayMapping(chart: any = null, colorGradient: NeColorGradient[] = [], index: string): void {
    this.index = index;
    this.mapping = this.dataService.findMappingById(index);

    if (chart !== null) {
      this.lineChartData = chart.chartData;
      this.lineChartLabels = chart.chartLabels;

      this.lineChartOptions = chart.lineChartOptions;
      this.lineChartObject = {
        chartData: this.lineChartData,
        chartLabels: this.lineChartLabels,
        lineChartOptions: this.lineChartOptions,
        chartType: this.chartType
      };
      this.showColorGradient = false;
      this.showComparison = false;
      this.showChart = true;

    } else if (colorGradient.length > 0) {

      let color = 'linear-gradient(90deg, ';
      const tmp = [];

      let foundLowest = false;
      let foundHighest = false;

      for (const gradient of colorGradient) {
        if (gradient.offset === '0%') {
          foundLowest = true;
        }
        if (gradient.offset === '100%') {
          foundHighest = true;
        }

        if (gradient.offset !== '-1' && gradient.offset !== '101') {
          tmp.push(gradient.color.concat(' '.concat(gradient.offset)));
        }
      }

      if (!foundLowest) {
        const lowestFallback = colorGradient.find(x => x.offset === '-1');
        tmp.splice(0, 0, lowestFallback.color.concat(' '.concat('0%')));
      }

      if (!foundHighest) {
        const highestFallback = colorGradient.find(x => x.offset === '101');
        tmp.push(highestFallback.color.concat(' '.concat('100%')));
      }

      color = color.concat(tmp.join(', '));
      color = color.concat(')');

      this.gradientBackground = colorGradient[0].color + ' ' + color;
      this.showComparison = false;
      this.showChart = false;
      this.showColorGradient = true;
    }
  }

  /**
   * Overrides the network's style property with the given color codes, duration will be reset if the view is
   * destroyed and reinitialized, because this is not stored within the network
   *
   * @param highlightNodes color to highlight the nodes
   * @param highlightEdges color to highlight the edges
   * @param highlightDuration duration to highlight each element in milliseconds
   */
  setHighlightColorAndDuration(highlightNodes: string, highlightEdges: string, highlightDuration: number): void {
    this.graphService.setHighlightColorAndDuration(highlightNodes, highlightEdges, highlightDuration);
    const colorStyle = {
      'background-color': highlightNodes,
      'line-color': highlightEdges,
      'source-arrow-color': highlightEdges,
      'target-arrow-color': highlightEdges
    };
    const styleIndex = this.dataService.networkSelected.style.findIndex(x => x.selector === '.custom_highlight_color');
    this.dataService.networkSelected.style[styleIndex].style = colorStyle;
  }

}
