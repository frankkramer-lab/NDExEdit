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
import {MainMappingsComponent} from '../main-mappings/main-mappings.component';
import {MainMappingsNewComponent} from '../main-mappings-new/main-mappings-new.component';

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})

/**
 * Component responsible for graph editing functionality
 */
export class SidebarEditComponent implements AfterViewInit, OnDestroy {

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
   * Selected network of type {@link NeNetwork|NeNetwork}
   */
  selectedNetwork: NeNetwork;

  /**
   * Checks if the view is initialized
   * @private
   */
  private isInitialized = false;

  /**
   * CSS property which is mapped by {@link SidebarEditComponent#attribute|this attribute}
   */
  lookup: string;

  /**
   * attribute responsible for {@link SidebarEditComponent#lookup|this CSS property's} value
   */
  attribute: string;

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
   * todo research and possibly delete because not necessary (?)
   */
  index = '';

  /**
   * chart data used to display numeric continuous mapping, initialized with default values.
   * See {@link ParseService#buildChartData} for more details
   */
  public lineChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];

  /**
   * chart labels used to display numeric continuous mapping
   * See {@link ParseService#buildChartData} for more details
   */
  public lineChartLabels: Label[] = [''];

  /**
   * chart cosmetics used to display numeric continuous mapping
   * See {@link ParseService#buildChartData} for more details
   */
  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(255,0,0,0.4)',
    }
  ];

  /**
   * chart options used to display numeric continuous mapping
   * See {@link ParseService#buildChartData} for more details
   */
  public lineChartOptions;

  /**
   * Default color for highlighting a lost node
   */
  highlightNodes = '';

  /**
   * Default color for highlighting a lost edge
   */
  highlightEdges = '';

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
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param dataService Service to read and write globally accessible data
   * @param route Service to read URL
   * @param graphService Service for graph manipulations
   */
  constructor(public dataService: DataService,
              private route: ActivatedRoute,
              public graphService: GraphService) {

    this.routerSubscription = this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      this.initColorHighlighting();
    });

    this.mappingsSubscription = MainMappingsComponent.mappingsEmitter.subscribe(data => {
      this.handleViewChanges(data);
    });

    this.mappingsNewSubscription = MainMappingsNewComponent.mappingsNewEmitter.subscribe(data => {
      this.handleViewChanges(data);
    });
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
  }

  /**
   * Sets initialized status, toggles labels with respect to network information
   * and initializes the color highlighting properties to be used for this specific network
   */
  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.graphService.toggleLabels(this.selectedNetwork.showLabels);
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

    if (this.mappingsSubscription) {
      this.mappingsSubscription.unsubscribe();
    }
    if (this.mappingsNewSubscription) {
      this.mappingsNewSubscription.unsubscribe();
    }
  }

  /**
   * Toggles labels by using a specific CSS class which overrides the values of the labels
   * @param show Determines if labels are to be displayed
   */
  toggleLabels(show: boolean): void {
    this.graphService.toggleLabels(show);
    this.selectedNetwork.showLabels = show;
  }

  /**
   * Displays details to a selected mapping within the sidebar
   * @param chart data for continuous mapping with numeric values; see {@link ParseService#buildChartData}
   * @param colorGradient data for continuous mapping with color based values; see {@link ParseService#buildColorGradient}
   * @param index todo
   */
  displayMapping(chart: any = null, colorGradient: NeColorGradient[] = [], index: string): void {
    this.index = index;
    if (chart !== null) {
      this.lookup = chart.lineChartOptions.title.text[0];
      this.attribute = chart.lineChartOptions.title.text[1];
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
    const styleIndex = this.selectedNetwork.style.findIndex(x => x.selector === '.custom_highlight_color');
    this.selectedNetwork.style[styleIndex].style = colorStyle;
  }

  /**
   * If there is network information for color highlighting this information is used
   * @private
   */
  private initColorHighlighting(): void {
    const colorStyle = this.selectedNetwork.style.find(x => x.selector === '.custom_highlight_color');
    if (colorStyle) {
      this.highlightNodes = colorStyle.style['background-color'];
      this.highlightEdges = colorStyle.style['line-color'];
    }
  }

}
