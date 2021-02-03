import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {DataService} from '../../services/data.service';
import {
  faArrowLeft,
  faArrowRight,
  faChartBar,
  faCheck,
  faPalette,
  faPlus,
  faQuestionCircle,
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
import {UtilityService} from '../../services/utility.service';
import {NeMappingsType} from '../../models/ne-mappings-type';
import {NeChartType} from '../../models/ne-chart-type';
import {NeChart} from '../../models/ne-chart';

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
   * Determines by URL if this component is used for editing or creating a new mapping.
   * Thus prefills the properties used in the form or prepares the new creation.
   *
   * @param route Current route
   * @param dataService Service used to find the currently selected network
   * @param utilityService Service used to access shared code
   */
  constructor(
    private route: ActivatedRoute,
    public dataService: DataService,
    public utilityService: UtilityService
  ) {

    switch (this.route.snapshot.url[0].path) {
      case 'new':
        this.isEdit = false;
        break;
      case 'edit':
        this.isEdit = true;
        break;
    }

    this.route.paramMap.subscribe(params => {
      this.initData(params);
    });

  }

  /**
   * Emits changes in mappings which also have to be visible within the sidebar
   */
  @Output() static mappingsNewEmitter: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Icon: faQuestionCircle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faQuestionCircle = faQuestionCircle;
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
   * Property for which a mapping is to be added
   */
  propertyToMap: NeAspect;

  /**
   * Object containing the type of mapping to be added
   */
  typeHint: NeMappingsType = null;

  /**
   * Since the same component is used for adding a new and editing an existing mapping this boolean determines if
   * the component is used for editing
   */
  isEdit: boolean;

  /**
   * True if the distribution chart for the selected property is to be shown
   */
  showDistribution = false;

  /**
   * True if the hints for continuous mappings are to be shown
   */
  showHints = false;
  /**
   * Determines which type of chart is to be displayed as distribution
   * Since scatter diagrams are to be replaced with histograms, we don't need further distinction
   * between discrete and continuous mappings
   */
  chartType: NeChartType = {
    line: false,
    bar: true
  };

  /**
   * Defines how many bins are used to display the histogram.
   * Initially calculated by {@link https://www.vosesoftware.com/riskwiki/Determiningthewidthofhistogrambars.php|Sturge's Rule}
   */
  binSize: number;

  /**
   * Calculation always leads to precision errors
   * To fix those the user has to be able to adjust these
   */
  precision = 4;

  /**
   * The CSS property for which the mapping is to be created or edited
   */
  @Input() styleProperty: string;

  /**
   * Distribution chart data for discrete aspects
   */
  barChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];

  /**
   * Distribution chart labels for discrete aspects
   */
  barChartLabels: Label[] = [''];

  /**
   * Chart Object
   */
  chartObject: NeChart;

  /**
   * Distribution chart data for continuous aspects
   */
  scatterChartData: ChartDataSets[] = [
    {data: [0], label: 'no data found'}
  ];

  /**
   * Distribution chart labels for continuous aspects
   */
  scatterChartLabels: Label[] = [''];

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
   * Points to property within the possible attributes of a network's elements (for new creation)
   */
  propertyId: number;

  /**
   * Points to already existing mapping which is to be edited
   */
  mapPointer: number;

  /**
   * Indicates if this new mapping or already existing mapping is discrete
   * @private
   */
  private isDiscrete: boolean;


  /**
   * Hides the label checkbox in the sidebar, because toggling it from here has no gain at all
   */
  ngOnInit(): void {
    // avoid confusion by hiding any mappings preview in sidebar
    MainMappingsNewComponent.mappingsNewEmitter.emit({showLabelCheckbox: false});
    this.chartType = {
      bar: true,
      line: false
    };
  }

  /**
   * Resets chart data and re-displays the label checkbox
   */
  ngOnDestroy(): void {
    this.showDistribution = false;
    this.barChartData = [];
    this.barChartLabels = [];
    this.scatterChartData = [];
    this.continuousThresholds = [];
    this.continuousMapping = null;
    this.discreteMapping = null;
    this.isEdit = null;
    this.isDiscrete = null;
    this.propertyId = null;
    this.binSize = null;
    this.chartObject = null;
    MainMappingsNewComponent.mappingsNewEmitter.emit({showLabelCheckbox: true});
  }

  /**
   * Toggles distribution chart
   * @param toggle new value
   */
  toggleDistributionChart(toggle: boolean): void {
    this.showDistribution = toggle;
  }

  /**
   * Is called on submission of and edited mapping and edits the continuous or discrete mapping
   * based on the previously set mappingstype
   */
  editMapping(): void {
    // if (this.typeHint.nd || this.typeHint.ed) {
    //   this.dataService.editMapping(this.dataService.networkSelected.id, this.discreteMapping, this.styleProperty, this.typeHint);
    // } else {
    //   this.dataService.editMapping(this.dataService.networkSelected.id, this.continuousMapping, this.styleProperty, this.typeHint);
    // }
  }

  /**
   * Reacting to the form's styleProperty
   * @param $event string set as styleProperty in child form
   */
  setStyleProperty($event: any): void {
    this.styleProperty = $event;
    console.log($event);
    console.log(this.propertyToMap);
  }

  /**
   * Initializes data for either editing or creating a new mapping
   *
   * @param params Passed routing params
   * @private Only needed on init
   */
  private initData(params: ParamMap): void {
    const map = params.get('map');
    const networkId = params.get('id');

    if (map && networkId) {
      this.dataService.selectNetwork(Number(networkId));
      this.currentMappingId = map.substring(2);
      const mapType = map.substring(0, 2);
      this.typeHint = this.utilityService.utilGetTypeHintByString(mapType);

      if (this.typeHint.ec || this.typeHint.nc) {
        this.isDiscrete = false;
      } else {
        this.isDiscrete = true;
      }

      if (this.isEdit) {
        this.initDataEdit(params);
      } else {
        this.initDataNew(params);
      }
    }
  }

  /**
   * Initializes data for creating a new mapping
   *
   * @param params Passed routing parameters
   * @private only needed on init
   */
  private initDataNew(params: ParamMap): void {
    this.isEdit = false;
    this.propertyId = Number(params.get('propertyId'));
    let availableAttributes: any[];

    if (this.typeHint.ec || this.typeHint.ed) {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesEdges;
    } else {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesNodes;
    }

    if (!this.isDiscrete) {
      availableAttributes = this.utilityService.utilFilterForContinuous(availableAttributes);
    } else {
      availableAttributes = this.utilityService.utilFilterForDiscrete(availableAttributes);
    }

    this.propertyToMap = availableAttributes[this.propertyId];

    if (this.isDiscrete) {
      this.chartObject = {
        chartData: this.propertyToMap.chartDiscreteDistribution.chartData,
        chartLabels: this.propertyToMap.chartDiscreteDistribution.chartLabels,
        chartType: this.chartType
      };
    } else {
      this.binSize = this.utilityService.utilSturgesRule(this.propertyToMap.chartContinuousDistribution.chartLabels);
      this.chartObject = this.utilityService.utilCalculateHistogramDataForBinSize(this.binSize, this.propertyToMap);
    }
    console.log(this.chartObject);

    if (this.typeHint.nc || this.typeHint.ec) {
      this.continuousMapping = {};
    } else {
      this.discreteMapping = [];
    }

  }

  /**
   * Initializes data for editing an existing mapping
   *
   * @param params Passed routing params
   * @private only needed on init
   */
  private initDataEdit(params: ParamMap): void {
    // edit existing
    this.isEdit = true;
    let existingMapping;
    const mapId = params.get('map').substring(2);

    switch (params.get('map').substring(0, 2)) {
      case 'nd':
        this.propertyId = Number(params.get('propertyId'));
        existingMapping = this.dataService.networkSelected.mappings.nodesDiscrete[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesNodes.find(x => x.name === existingMapping.classifier);
        this.styleProperty = existingMapping.styleMap[this.propertyId].cssKey;
        this.discreteMapping = existingMapping;
        break;
      case 'nc':
        existingMapping = this.dataService.networkSelected.mappings.nodesContinuous[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesNodes.find(x => x.name === existingMapping.title[1]);
        this.styleProperty = existingMapping.title[0];
        this.continuousMapping = existingMapping;
        this.binSize = this.utilityService.utilSturgesRule(this.propertyToMap.chartContinuousDistribution.chartLabels);
        this.chartObject = this.utilityService.utilCalculateHistogramDataForBinSize(this.binSize,
          this.propertyToMap);
        break;
      case 'ed':
        this.propertyId = Number(params.get('propertyId'));
        existingMapping = this.dataService.networkSelected.mappings.edgesDiscrete[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesEdges.find(x => x.name === existingMapping.classifier);
        this.styleProperty = existingMapping.styleMap[this.propertyId].cssKey;
        this.discreteMapping = existingMapping;
        break;
      case 'ec':
        existingMapping = this.dataService.networkSelected.mappings.edgesContinuous[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesEdges.find(x => x.name === existingMapping.title[1]);
        this.styleProperty = existingMapping.title[0];
        this.continuousMapping = existingMapping;
        this.binSize = this.utilityService.utilSturgesRule(this.propertyToMap.chartContinuousDistribution.chartLabels);
        this.chartObject = this.utilityService.utilCalculateHistogramDataForBinSize(this.binSize,
          this.propertyToMap);
        break;
    }
  }

  /**
   * As numbers of bins are increased or decreased, the distribution needs to be recalculated
   *
   * @param $event
   */
  changeBinSize($event: number): void {
    this.binSize = $event;
    this.chartObject = this.utilityService.utilCalculateHistogramDataForBinSize(
      this.binSize,
      this.propertyToMap);
  }
}

