import {Component, Input, OnInit} from '@angular/core';
import {ElementType, MappingType, UtilityService} from '../../../services/utility.service';
import {DataService} from '../../../services/data.service';
import {LayoutService} from '../../../services/layout.service';
import {NeMappingContinuous} from '../../../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../../../models/ne-mapping-discrete';
import {NeMapping} from '../../../models/ne-mapping';
import {NeAspect} from '../../../models/ne-aspect';
import {NeChart} from '../../../models/ne-chart';
import {faExclamationTriangle, faTrash} from '@fortawesome/free-solid-svg-icons';
import {NeMappingEmission} from '../../../models/ne-mapping-emission';
import {PropertyService} from '../../../services/property.service';

@Component({
  selector: 'app-sidebar-edit-mapping',
  templateUrl: './sidebar-edit-mapping.component.html',
  styleUrls: ['./sidebar-edit-mapping.component.scss']
})
export class SidebarEditMappingComponent implements OnInit {
  /**
   * Type of elements whose mappings are displayed
   */
  @Input() elementType: ElementType;
  /**
   * Type of element used for labels, either 'NODES' or 'EDGES'
   */
  elementTypeLiteral: string;
  /**
   * Points to the index of a passthrough mapping whose chart is currently being displayed
   */
  passthroughChartIndex: number = null;
  /**
   * Chart object for a passthrough mapping
   */
  passthroughChart: NeChart;
  /**
   * List of passthrough mappings
   */
  pMappings: NeMapping[];
  /**
   * List of discrete mappings
   */
  dMappings: NeMappingDiscrete[];
  /**
   * List of continuous mappings
   */
  cMappings: NeMappingContinuous[];

  /**
   * List of passthrough mappings to be deleted
   */
  pForDeletion: NeMapping[] = [];

  /**
   * List of discrete mappings to be deleted
   */
  dForDeletion: NeMappingDiscrete[] = [];

  /**
   * List of continuous mappings to be deleted
   */
  cForDeletion: NeMappingContinuous[] = [];

  /**
   * Resets all node or edges mappings and properties back to defaults
   */
  hardReset = false;

  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faExclamationTriangle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExclamationTriangle = faExclamationTriangle;
  /**
   * True, when the node or edge parent is collapsed
   */
  collapsedParent = true;

  /**
   * True, when the passthrough child is collapsed
   */
  collapsedChildPassthrough = false;

  /**
   * True, when the discrete child is collapsed
   */
  collapsedChildDiscrete = false;

  /**
   * True, when the continuous child is collapsed
   */
  collapsedChildContinuous = false;

  /**
   * True, when default styles child is collapsed
   */
  collapsedChildDefault = true;

  constructor(
    public utilityService: UtilityService,
    public dataService: DataService,
    public layoutService: LayoutService,
    private propertyService: PropertyService
  ) {
  }

  ngOnInit(): void {
    this.elementTypeLiteral = this.elementType === this.utilityService.elementType.node ? 'NODES' : 'EDGES';
    this.fetchMappings();
  }

  /**
   * Updates the local mapping collections to also display newly added mappings or to remove removed mappings
   * @param mappingType Type of mapping to not always fetch all mapping types
   */
  fetchMappings(mappingType: MappingType = null): void {

    if (this.elementType === this.utilityService.elementType.node) {
      if (mappingType === this.utilityService.mappingType.passthrough || mappingType === null) {
        this.pMappings = this.dataService.selectedNetwork.mappings.nodesPassthrough;
      }
      if (mappingType === this.utilityService.mappingType.discrete || mappingType === null) {
        this.dMappings = this.dataService.selectedNetwork.mappings.nodesDiscrete;
      }
      if (mappingType === this.utilityService.mappingType.continuous || mappingType === null) {
        this.cMappings = this.dataService.selectedNetwork.mappings.nodesContinuous;
      }
    } else {
      if (mappingType === this.utilityService.mappingType.passthrough || mappingType === null) {
        this.pMappings = this.dataService.selectedNetwork.mappings.edgesPassthrough;
      }
      if (mappingType === this.utilityService.mappingType.discrete || mappingType === null) {
        this.dMappings = this.dataService.selectedNetwork.mappings.edgesDiscrete;
      }
      if (mappingType === this.utilityService.mappingType.continuous || mappingType === null) {
        this.cMappings = this.dataService.selectedNetwork.mappings.edgesContinuous;
      }
    }
  }

  /**
   * Deletes a whole mapping collection for all nodes or for all edges
   */
  deleteMappingCollections(): void {
    const mappings: NeMapping[] = this.pForDeletion.concat(this.dForDeletion).concat(this.cForDeletion);
    for (const mapping of mappings) {
      this.dataService.removeAllMappingsByCol(mapping.col, mapping.mappingType, this.elementType);
      this.propertyService.handleMappingRemoved(this.elementType, mapping.mappingType, mapping.col);
      this.propertyService.handleStyleRemoved(mapping.styleProperty);
      this.fetchMappings(mapping.mappingType);
    }
    this.pForDeletion = [];
    this.dForDeletion = [];
    this.cForDeletion = [];
  }

  /**
   * Marks a mapping collection to be deleted, used for all element types and mapping types
   * @param col Name of the column that aggregates the collection
   * @param mappingType Type of mapping, either 'passthrough', 'discrete' or 'continuous'
   */
  markForDeletion(col: string, mappingType: MappingType): void {

    switch (mappingType) {
      case MappingType.passthrough:
        const pBaseList = this.pForDeletion.map(a => a.col);
        if (pBaseList.includes(col)) {
          this.pForDeletion = this.pForDeletion.filter(a => a.col !== col);
        } else {
          this.pForDeletion = this.pForDeletion.concat(this.dataService.findAllMappingsPassthroughByCol(col, this.elementType));
        }
        break;
      case MappingType.discrete:
        const dBaseList = this.dForDeletion.map(a => a.col);
        if (dBaseList.includes(col)) {
          this.dForDeletion = this.dForDeletion.filter(a => a.col !== col);
        } else {
          this.dForDeletion = this.dForDeletion.concat(this.dataService.findAllMappingsDiscreteByCol(col, this.elementType));
        }
        break;
      case MappingType.continuous:
        const cBaseList = this.cForDeletion.map(a => a.col);
        if (cBaseList.includes(col)) {
          this.cForDeletion = this.cForDeletion.filter(a => a.col !== col);
        } else {
          this.cForDeletion = this.cForDeletion.concat(this.dataService.findAllMappingsContinuousByCol(col, this.elementType));
        }
        break;
    }
  }

  /**
   * Handles this component's children's flash or edit mode for editing existing mappings.
   * Currently using data service as a state service
   * @param inFlashOrEditMode True, if a child is entering flash or edit mode, false else
   * @param elementType Type of element in flash or edit mode or exiting flash or edit mode
   * @param mappingType Type of mapping in flash or edit mode or exiting flash or edit mode
   */
  handleChildFlashOrEditMode(inFlashOrEditMode: boolean, elementType: ElementType, mappingType: MappingType): void {
    this.dataService.objInEditing = {
      elementType: inFlashOrEditMode ? elementType : null,
      mappingType: inFlashOrEditMode ? mappingType : null,
      nwInfo: false,
      nwVisuals: false
    };
    this.dataService.lockRouting = inFlashOrEditMode;
    this.fetchMappings();
  }

  /**
   * Displays a distribution chart for a passthrough mapping
   * @param passthroughMappingIndex Points to the mapping index
   * @param mapping Passthrough mapping
   */
  displayDistributionChart(passthroughMappingIndex: number, mapping: NeMapping): void {
    let aspect: NeAspect;
    if (this.elementType === this.utilityService.elementType.node) {
      aspect = this.dataService.selectedNetwork.aspectKeyValuesNodes.find(a => a.name === mapping.col);
    } else {
      aspect = this.dataService.selectedNetwork.aspectKeyValuesEdges.find(a => a.name === mapping.col);
    }

    if (this.passthroughChartIndex === passthroughMappingIndex
      && (this.passthroughChart === aspect.chartContinuousDistribution
        || this.passthroughChart === aspect.chartDiscreteDistribution)) {
      this.passthroughChartIndex = null; // hide on second toggle
    } else {

      if (!!aspect.chartContinuousDistribution) {
        this.passthroughChart = aspect.chartContinuousDistribution;
      } else {
        this.passthroughChart = aspect.chartDiscreteDistribution;
      }
      this.passthroughChartIndex = passthroughMappingIndex;

    }
  }

  /**
   * Called when adding a new mapping collection
   * @param mappingEmission Object containing all information necessary to handle a newly added mapping
   */
  handleNewMapping(mappingEmission: NeMappingEmission): void {

    if (mappingEmission.elementType === this.elementType) {
      this.handleChildFlashOrEditMode(mappingEmission.mappingType !== MappingType.passthrough,
        mappingEmission.elementType, mappingEmission.mappingType);
      switch (mappingEmission.mappingType) {
        case MappingType.discrete:
          this.dataService.selectedDiscreteMapping = this.dataService
            .findAllMappingsDiscreteByCol(mappingEmission.aspect.name, mappingEmission.elementType);
          break;
        case MappingType.continuous:
          this.dataService.selectedContinuousMapping = this.dataService
            .findAllMappingsContinuousByCol(mappingEmission.aspect.name, mappingEmission.elementType);
          break;
      }
    }
  }

  /**
   * Deletes all properties and mappings for this {@link elementType}, except for NODE_LABEL
   * @param confirmation if true, executes the deletion, else it is aborted
   */
  deleteAll(confirmation: boolean): void {
    if (confirmation) {
      this.dataService.resetElementAspect(this.elementType);
      this.fetchMappings();
    }
    this.hardReset = false;
    this.dForDeletion = [];
    this.cForDeletion = [];
    this.pForDeletion = [];
    this.propertyService.initAvailables(this.dataService.selectedNetwork);
  }

  /**
   * Initializes the default styles necessary for data dependent visualization
   */
  initDefaultStyles(): void {
    this.dataService.initDefaultStyles();
    this.fetchMappings();
  }
}
