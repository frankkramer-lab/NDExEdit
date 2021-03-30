import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {
  faArrowLeft,
  faCheck,
  faChevronDown,
  faClone,
  faCogs,
  faLightbulb,
  faMagic,
  faPalette,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {NeColorGradient} from '../../models/ne-color-gradient';
import {MainMappingsComponent} from '../main-mappings/main-mappings.component';
import {MainMappingsNewComponent} from '../main-mappings-new/main-mappings-new.component';
import {NeChart} from '../../models/ne-chart';
import {NeChartType} from '../../models/ne-chart-type';
import {NeMappingDiscrete} from '../../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../../models/ne-mapping-continuous';
import {NeHighlightForm} from '../../models/ne-highlight-form';
import {NeAspect} from '../../models/ne-aspect';
import {UtilityService} from '../../services/utility.service';

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
   * Icon: faChevronDown
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronDown = faChevronDown;
  /**
   * Icon: faCogs
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCogs = faCogs;
  /**
   * Icon: faArrowLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowLeft = faArrowLeft;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
  /**
   * Icon: faClone
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
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
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
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
   * List of user defined inspections,
   * e.g. 'Highlight all nodes, where 'Bait_boolean' = 1'
   */
  highlightListDefinition: NeHighlightForm[] = [];
  /**
   * Currently user defined inspection
   */
  highlightDefinition: NeHighlightForm = {
    property: null,
    type: null,
    typeLabel: null,
    markedForDeletion: false,
    sameAs: null,
    rangeLower: null,
    rangeUpper: null
  };

  /**
   * 'numeric' or 'text', where 'numeric' indicates that a property should be selected based on min and max thresholds.
   * 'text' indicates, that a discrete value for the chosen property is needed.
   * Integer based properties should be treated as numeric.
   */
  highlightDefinitionDatatype: string;
  /**
   * Type of chart to be displayed
   */
  chartType: NeChartType = {
    line: true,
    bar: false
  };
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
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param dataService Service to read and write globally accessible data
   * @param route Service to read URL
   * @param graphService Service for graph manipulations
   * @param utilityService
   */
  constructor(
    public dataService: DataService,
    private route: ActivatedRoute,
    public graphService: GraphService,
    public utilityService: UtilityService
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
    this.dataService.selectedNetwork.core.elements().unselect();
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
    this.dataService.getSelectedNetwork().showLabels = show;
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

      this.lineChartOptions = chart.chartOptions;
      this.lineChartObject = {
        chartData: this.lineChartData,
        chartLabels: this.lineChartLabels,
        chartOptions: this.lineChartOptions,
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
   */
  setHighlightColorAndDuration(): void {
    this.graphService.setHighlightColorAndDuration(this.highlightNodes, this.highlightEdges, this.highlightDuration);
  }

  /**
   * Returns attributes related to nodes or edges
   * @param type
   */
  getAvailablePropertiesByType(type: string): NeAspect[] {
    if (type === 'node') {
      return this.dataService.getSelectedNetwork().aspectKeyValuesNodes;
    }
    return this.dataService.getSelectedNetwork().aspectKeyValuesEdges;
  }

  /**
   * Adds the property to the highlight definition the user is currently defining
   * @param property
   */
  selectProperty(property: NeAspect): void {
    this.highlightDefinition.property = property;

    if (this.utilityService.utilFitForContinuous(property)) {
      this.highlightDefinitionDatatype = 'numeric';
      this.highlightDefinition.rangeLower = property.min;
      this.highlightDefinition.rangeUpper = property.max;
    } else {
      this.highlightDefinitionDatatype = 'text';
    }
  }

  /**
   * Sets the type of the current inspection
   * @param type
   */
  selectType(type: string): void {
    this.highlightDefinitionDatatype = null;
    this.highlightDefinition.type = type;
    this.highlightDefinition.typeLabel = (type === 'node') ? 'SIDEBAR_EDIT_INSPECT_TYPE_NODE' : 'SIDEBAR_EDIT_INSPECT_TYPE_EDGE';
  }


  /**
   * Submits a definition to the list of definitions the user wants to highlight
   */
  addHighlightDefinitionToList(): void {

    if (this.highlightDefinitionDatatype === 'numeric') {
      this.highlightDefinition.rangeLower = Number(this.highlightDefinition.rangeLower);
      this.highlightDefinition.rangeUpper = Number(this.highlightDefinition.rangeUpper);
    }

    this.highlightListDefinition.push(this.highlightDefinition);

    this.highlightDefinition = {
      property: null,
      type: null,
      typeLabel: null,
      markedForDeletion: false,
      sameAs: null,
      rangeLower: null,
      rangeUpper: null
    };
    this.highlightDefinitionDatatype = null;
  }


  /**
   * Marks an inspection from the list as to be deleted
   * @param index Points to the specified element
   */
  markForDeletion(index: number): void {
    this.highlightListDefinition[index].markedForDeletion = true;
  }

  /**
   * Removes the mark to be deleted from the inspection
   * @param index Points to the specified element
   */
  unmarkForDeletion(index: number): void {
    this.highlightListDefinition[index].markedForDeletion = false;
  }

  /**
   * Removes the element from the list of inspections
   * @param index Points to the specified element
   */
  deleteFromHighlightList(index: number): void {
    this.highlightListDefinition.splice(index, 1);
  }
}
