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
import {NeAspect} from '../../models/ne-aspect';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {NeThresholdMap} from '../../models/ne-threshold-map';
import {UtilityService} from '../../services/utility.service';
import {NeMappingsType} from '../../models/ne-mappings-type';
import {NeChartType} from '../../models/ne-chart-type';
import {NeChart} from '../../models/ne-chart';
import {NeMappingDiscrete} from '../../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../../models/ne-mapping-continuous';
import {NeMappingPassthrough} from '../../models/ne-mapping-passthrough';

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

    this.route.paramMap.subscribe(params => {
      this.isEdit = params.get('isEdit') === '1';
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
   * Newly created or existing discrete mapping to be edited
   */
  discreteMapping: NeMappingDiscrete;

  /**
   * Newly created or existing continuous mapping to be edited
   */
  continuousMapping: NeMappingContinuous;

  /**
   * Thresholds that belong to this {@link MainMappingsNewComponent#continuousMapping}
   */
  continuousThresholds: NeThresholdMap[] = [];

  /**
   * Newly created passthrough mapping
   */
  passthroughMapping: NeMappingPassthrough;

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
   * Indicates if this new mapping or already existing mapping is continuous
   * @private
   */
  private isContinuous: boolean;
  /**
   * Indicates if this new mapping or already existing mapping is passthrough
   * @private
   */
  private isPassthrough: boolean;


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
   * Reacting to the form's styleProperty
   * @param $event string set as styleProperty in child form
   */
  setStyleProperty($event: any): void {
    this.styleProperty = $event;
  }

  /**
   * Initializes data for either editing or creating a new mapping
   *
   * @param params Passed routing params
   * @private Only needed on init
   */
  private initData(params: ParamMap): void {
    const mapType = params.get('map');

    if (mapType) {
      const type = mapType.substring(0, 2);
      const index = mapType.substring(2);

      this.typeHint = this.utilityService.utilGetTypeHintByString(type);

      this.isContinuous = this.typeHint.ec || this.typeHint.nc;
      this.isDiscrete = this.typeHint.nd || this.typeHint.ed;
      this.isPassthrough = this.typeHint.np || this.typeHint.ep;

      if (this.isEdit) {
        this.initDataEdit(Number(index));
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

    this.propertyId = Number(params.get('propertyId'));
    this.isEdit = false;
    this.dataService.resetAnyMappingSelection();

    let availableAttributes: any[];

    if (this.typeHint.ec || this.typeHint.ed || this.typeHint.ep) {
      availableAttributes = this.dataService.selectedNetwork.aspectKeyValuesEdges;
    } else {
      availableAttributes = this.dataService.selectedNetwork.aspectKeyValuesNodes;
    }

    if (this.isContinuous) {
      availableAttributes = this.utilityService.utilFilterForContinuous(availableAttributes);
      this.propertyToMap = availableAttributes[this.propertyId];

      // todo rework to make binsize changeable for integer based continuous mappings
      this.chartObject = (this.propertyToMap.datatype === 'integer'
        ? this.propertyToMap.chartDiscreteDistribution
        : this.propertyToMap.chartContinuousDistribution);

      this.binSize = (this.propertyToMap.datatype === 'integer')
        ? null
        : this.utilityService.utilSturgesRule(this.propertyToMap.numericValues);

      this.continuousMapping = {
        chart: undefined,
        cleanStyleProperty: '',
        col: this.propertyToMap.name,
        colorGradient: [],
        equals: undefined,
        greaters: undefined,
        isColor: false,
        lowers: undefined,
        styleProperty: '',
        thresholds: [],
        type: this.propertyToMap.datatype
      };
    } else if (this.isDiscrete) {
      availableAttributes = this.utilityService.utilFilterForDiscrete(availableAttributes);
      this.propertyToMap = availableAttributes[this.propertyId];

      this.chartObject = this.propertyToMap.chartDiscreteDistribution;

      const values: string[] = new Array<string>(this.propertyToMap.values.length);
      this.discreteMapping = {
        col: this.propertyToMap.name,
        keys: this.propertyToMap.values,
        styleProperty: '',
        type: this.propertyToMap.datatype,
        values,
        useValue: Array(values.length).fill(true)
      };
    } else {
      this.propertyToMap = availableAttributes[this.propertyId];

      if (this.propertyToMap.datatype === 'integer' || !this.propertyToMap.validForContinuous) {
        this.chartObject = this.propertyToMap.chartDiscreteDistribution;
      } else {
        this.chartObject = this.propertyToMap.chartContinuousDistribution;
      }

      this.passthroughMapping = {
        col: this.propertyToMap.name,
        styleProperty: ''
      };
    }

    if (this.isDiscrete) {
      this.continuousMapping = null;
      this.passthroughMapping = null;
    } else if (this.isContinuous) {
      this.discreteMapping = null;
      this.passthroughMapping = null;
    } else {
      this.discreteMapping = null;
      this.continuousMapping = null;
    }
  }

  /**
   * Initializes data for editing an existing mapping
   *
   * index number pointing to index of a mapping or property for a collection of discrete mappings
   * @private only needed on init
   */
  private initDataEdit(index: number): void {

    this.isEdit = true;
    let mapping: NeMappingDiscrete | NeMappingContinuous;

    if (this.typeHint.nd) {
      mapping = this.dataService.selectedNetwork.mappings.nodesDiscrete[index];
      this.discreteMapping = mapping;
      this.dataService.selectMapping('nd', mapping.col);
    } else if (this.typeHint.nc) {
      mapping = this.dataService.selectedNetwork.mappings.nodesContinuous[index];
      this.continuousMapping = mapping;
      this.dataService.selectMapping(null, null, 'nc' + index);
    } else if (this.typeHint.ed) {
      mapping = this.dataService.selectedNetwork.mappings.edgesDiscrete[index];
      this.discreteMapping = mapping;
      this.dataService.selectMapping('ed', mapping.col);
    } else if (this.typeHint.ec) {
      mapping = this.dataService.selectedNetwork.mappings.edgesContinuous[index];
      this.continuousMapping = mapping;
      this.dataService.selectMapping(null, null, 'ec' + index);
    }

    this.styleProperty = mapping.styleProperty;

    if (this.typeHint.nd || this.typeHint.nc) {
      this.propertyToMap = this.dataService.selectedNetwork.aspectKeyValuesNodes.find(a => a.name === mapping.col);
    } else if (this.typeHint.ed || this.typeHint.ec) {
      this.propertyToMap = this.dataService.selectedNetwork.aspectKeyValuesEdges.find(a => a.name === mapping.col);
    }

    if (this.typeHint.nd || this.typeHint.ed) {
      this.chartObject = this.propertyToMap.chartDiscreteDistribution;
    } else if (this.typeHint.nc || this.typeHint.ec) {
      this.chartObject = this.propertyToMap.chartContinuousDistribution;
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

  /**
   * Returns the continuously updated style property
   */
  getCurrentStyleProperty(): string {
    return this.styleProperty;
  }
}

