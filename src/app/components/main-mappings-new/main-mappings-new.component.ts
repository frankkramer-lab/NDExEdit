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
   * Emits changes in mappings which also have to be visible within the sidebar
   */
  @Output() static mappingsNewEmitter: EventEmitter<any> = new EventEmitter<any>();

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
  propertyIdNew: number;

  /**
   * Points to property within the possible attributes of a network's elements (for editing)
   */
  propertyIdEdit: number;

  /**
   * Points to already existing mapping which is to be edited
   */
  mapPointer: number;


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
      this.initData(params);

    });
  }

  /**
   * Sets chart data for distribution of the selected aspect and hides the label checkbox
   */
  ngOnInit(): void {
    this.barChartData = this.propertyToMap.chartDiscreteDistribution.chartData;
    this.barChartLabels = this.propertyToMap.chartDiscreteDistribution.chartLabels;
    this.scatterChartData = this.propertyToMap.chartContinuousDistribution.chartData;

    // avoid confusion by hiding any mappings preview in sidebar
    MainMappingsNewComponent.mappingsNewEmitter.emit({showLabelCheckbox: false});
  }

  /**
   * Resets chart data and re-displays the label checkbox
   */
  ngOnDestroy(): void {
    console.log('PARENT DESTROY');

    this.showDistribution = false;
    this.barChartData = [];
    this.barChartLabels = [];
    this.scatterChartData = [];
    this.continuousThresholds = [];
    this.continuousMapping = null;
    this.discreteMapping = null;
    this.isEdit = null;
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
    if (this.typeHint.nd || this.typeHint.ed) {
      this.dataService.editMapping(this.dataService.networkSelected.id, this.discreteMapping, this.styleProperty, this.typeHint);
    } else {
      this.dataService.editMapping(this.dataService.networkSelected.id, this.continuousMapping, this.styleProperty, this.typeHint);
    }
  }

  /**
   * Reacting to the form's styleProperty
   * @param $event string set as styleProperty in child form
   */
  setStyleProperty($event: any): void {
    this.styleProperty = $event;
  }

  private initData(params: ParamMap): void {
    const map = params.get('map');
    const networkId = params.get('id');

    if (map && networkId) {
      this.dataService.selectNetwork(Number(networkId));
      this.currentMappingId = map.substring(2);
      const mapType = map.substring(0, 2);
      this.typeHint = this.utilityService.utilGetTypeHintByString(mapType);

      if (params.get('property')) {
        // create new
        this.isEdit = false;
        this.initDataNew(params);

      } else {
        // edit
        this.isEdit = true;
        this.initDataEdit(params);

      }
    }
  }

  private initDataNew(params: ParamMap): void {
    this.propertyIdNew = Number(params.get('property'));

    let availableAttributes: any[];

    if (this.typeHint.ec || this.typeHint.ed) {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesEdges;
    } else {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesNodes;
    }

    if (this.typeHint.ec || this.typeHint.nc) {
      availableAttributes = availableAttributes
        .filter(a => a.datatype && (a.datatype === 'integer' || a.datatype === 'float' || a.datatype === 'double'));
    } else {
      availableAttributes = availableAttributes
        .filter(a => !a.datatype || a.datatype === 'integer' || a.datatype === 'string' || a.datatype === null);
    }

    this.propertyToMap = availableAttributes[this.propertyIdNew];

    if (this.typeHint.nc || this.typeHint.ec) {
      this.continuousMapping = {};
    } else {
      this.discreteMapping = [];
    }

  }

  private initDataEdit(params: ParamMap): void {
    // edit existing
    let existingMapping;
    const mapId = params.get('map').substring(2);

    switch (params.get('map').substring(0, 2)) {
      case 'nd':
        this.propertyIdEdit = Number(params.get('propertyId'));
        existingMapping = this.dataService.networkSelected.mappings.nodesDiscrete[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesNodes.find(x => x.name === existingMapping.classifier);
        this.styleProperty = existingMapping.styleMap[this.propertyIdEdit].cssKey;
        this.discreteMapping = existingMapping;
        break;
      case 'nc':
        existingMapping = this.dataService.networkSelected.mappings.nodesContinuous[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesNodes.find(x => x.name === existingMapping.title[1]);
        this.styleProperty = existingMapping.title[0];
        this.continuousMapping = existingMapping;
        break;
      case 'ed':
        this.propertyIdEdit = Number(params.get('propertyId'));
        existingMapping = this.dataService.networkSelected.mappings.edgesDiscrete[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesEdges.find(x => x.name === existingMapping.classifier);
        this.styleProperty = existingMapping.styleMap[this.propertyIdEdit].cssKey;
        this.discreteMapping = existingMapping;
        break;
      case 'ec':
        existingMapping = this.dataService.networkSelected.mappings.edgesContinuous[mapId];
        this.propertyToMap = this.dataService.networkSelected.aspectKeyValuesEdges.find(x => x.name === existingMapping.title[1]);
        this.styleProperty = existingMapping.title[0];
        this.continuousMapping = existingMapping;
        break;
    }
  }
}

