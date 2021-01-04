import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowLeft, faCheck, faEdit, faPlus, faSearch, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';
import {NeGroupedMappingsDiscrete} from '../../models/ne-grouped-mappings-discrete';
import {NeMappingProperty} from '../../models/ne-mapping-property';
import {NeMappingsType} from "../../models/ne-mappings-type";
import {NeAspect} from "../../models/ne-aspect";
import {UtilityService} from "../../services/utility.service";
import {NeContinuousCollection} from "../../models/ne-continuous-collection";

@Component({
  selector: 'app-main-mappings',
  templateUrl: './main-mappings.component.html',
  styleUrls: ['./main-mappings.component.scss']
})

/**
 * Component responsible for displaying existing mappings
 */
export class MainMappingsComponent implements OnInit, OnDestroy {

  /**
   * Emits changes in mappings which also have to be visible within the sidebar.
   * Emitted data as the following valid keys:
   * <ul>
   *   <li>showLabelCheckbox</li>
   *   <li>showGradient</li>
   *   <li>showChart</li>
   *   <li>clearSelection</li>
   * </ul>
   */
  @Output() static mappingsEmitter: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
  /**
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Icon: faSearch
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSearch = faSearch;
  /**
   * Icon: faArrowLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowLeft = faArrowLeft;
  /**
   * Displays deletion dialogue for the whole mapping
   */
  showGlobalDeletionDialogue = false;
  /**
   * Displays deletion dialogue for a single property within a mapping
   */
  showSingleDeletionDialogue = false;
  /**
   * Selected mapping which is displayed in the table at the top of the view
   */
  selectedMapping: NeGroupedMappingsDiscrete[] | any[];
  /**
   * Id of the currently selected mapping
   */
  currentMappingId: string[];
  /**
   * Mapping to be removed which is overridden as soon as the user selects a mapping to delete
   */
  mappingToRemove = {
    map: null,
    type: '',
    network: -1,
    mappingId: -1,
    akvIndex: -1,
  };
  /**
   * Property to be removed which is overridden as soon as the user selects a property to delete
   */
  propertyToRemove: NeMappingProperty = {
    mapReference: -1,
    attributeName: '',
    mapType: '',
    style: null
  };
  /**
   * Can be one of the following types:
   * <ul>
   *   <li><b>nd</b>: discrete node mapping</li>
   *   <li><b>nc</b>: continuous node mapping</li>
   *   <li><b>ed</b>: discrete edge mapping</li>
   *   <li><b>ec</b>: continuous edge mapping</li>
   * </ul>
   */
  givenMapType: string;

  /**
   * The URL rendering this view contains both the specified graph and a mapping whose details are displayed.
   * Thus within the constructor both {@link DataService#networkSelected} and
   * {@link MainMappingsComponent#selectedMapping} are set
   *
   * @param route Service to read URL
   * @param dataService Service to read and write to globally accessible data
   * @param utilityService Service used to access shared code
   */
  constructor(
    private route: ActivatedRoute,
    public dataService: DataService,
    public utilityService: UtilityService
  ) {

    this.route.paramMap.subscribe(params => {
      const networkId = params.get('id');
      if (networkId) {
        dataService.selectNetwork(Number(networkId));
        this.givenMapType = params.get('map').substring(0, 2);
        this.currentMappingId = params.get('map').substring(2).split('-');
        this.selectedMapping = [];

        switch (this.givenMapType) {
          case 'ec':
            for (const mapIndex of this.currentMappingId) {
              this.selectedMapping.push(dataService.networkSelected.mappings.edgesContinuous[mapIndex]);
            }
            break;
          case 'nc':
            for (const mapIndex of this.currentMappingId) {
              this.selectedMapping.push(dataService.networkSelected.mappings.nodesContinuous[mapIndex]);
            }
            break;
          case 'ed':
            for (const mapIndex of this.currentMappingId) {
              this.selectedMapping.push(dataService.networkSelected.mappings.edgesDiscrete[mapIndex]);
            }
            break;
          case 'nd':
            for (const mapIndex of this.currentMappingId) {
              this.selectedMapping.push(dataService.networkSelected.mappings.nodesDiscrete[mapIndex]);
            }
            break;
          default:
            break;
        }
      }
    });
  }

  /**
   * On initialization the emitter informs its subscribers to hide the label checkbox to prevent unnecessary toggling
   */
  ngOnInit(): void {
    MainMappingsComponent.mappingsEmitter.emit({showLabelCheckbox: false, clearSelection: true});
  }

  /**
   * On destruction the label checkbox is re-displayed
   */
  ngOnDestroy(): void {
    MainMappingsComponent.mappingsEmitter.emit({showLabelCheckbox: true});
  }

  /**
   * Toggles the dialogue to confirm deletion of an existing mapping. Selects the mapping to be deleted by
   * overriding {@link MainMappingsComponent#mappingToRemove}
   *
   * @param map Single mapping which is to be deleted
   * @param type As specified by {@link MainMappingsComponent#givenMapType}
   */
  toggleGlobalRemoveDialogue(map: any = null, type: string = ''): void {
    switch (type) {
      case 'nd':
        for (const akv of this.dataService.networkSelected.aspectKeyValuesNodes) {
          if (akv.name === map.classifier) {
            this.mappingToRemove.akvIndex = this.dataService.networkSelected.aspectKeyValuesNodes.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.dataService.networkSelected.mappings.nodesDiscrete.indexOf(map);
        break;
      case 'nc':
        for (const akv of this.dataService.networkSelected.aspectKeyValuesNodes) {
          if (akv.name === map.title[1]) {
            this.mappingToRemove.akvIndex = this.dataService.networkSelected.aspectKeyValuesNodes.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.dataService.networkSelected.mappings.nodesContinuous.indexOf(map);
        break;
      case 'ed':
        for (const akv of this.dataService.networkSelected.aspectKeyValuesEdges) {
          if (akv.name === map.classifier) {
            this.mappingToRemove.akvIndex = this.dataService.networkSelected.aspectKeyValuesEdges.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.dataService.networkSelected.mappings.edgesDiscrete.indexOf(map);
        break;
      case 'ec':
        for (const akv of this.dataService.networkSelected.aspectKeyValuesEdges) {
          if (akv.name === map.title[1]) {
            this.mappingToRemove.akvIndex = this.dataService.networkSelected.aspectKeyValuesEdges.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.dataService.networkSelected.mappings.edgesContinuous.indexOf(map);
        break;
    }
    this.showGlobalDeletionDialogue = !this.showGlobalDeletionDialogue;
    this.mappingToRemove.map = map;
    this.mappingToRemove.type = type;
    this.mappingToRemove.network = this.dataService.networkSelected.id;
  }

  /**
   * Toggles the dialogue to confirm deletion of a property from an existing mapping.
   *
   * @param map mapping to remove the property from
   * @param mapType type of property
   * @param style the style object matching the selected property
   */
  toggleSingleRemoveDialogue(map: any = null, mapType: string = '', style: any = null): void {
    if (map && map.styleMap.length === 1) {
      this.toggleGlobalRemoveDialogue(map, mapType);
      return;
    }

    this.propertyToRemove.style = style;
    this.propertyToRemove.mapType = mapType;
    if (map) {
      this.propertyToRemove.attributeName = map.classifier;
    }
    switch (mapType) {
      case 'nd':
        this.propertyToRemove.mapReference = this.dataService.networkSelected.mappings.nodesDiscrete.indexOf(map);
        this.showSingleDeletionDialogue = true;
        break;
      case 'nc':
        this.propertyToRemove.mapReference = this.dataService.networkSelected.mappings.nodesContinuous.indexOf(map);
        this.showSingleDeletionDialogue = true;
        break;
      case 'ed':
        this.propertyToRemove.mapReference = this.dataService.networkSelected.mappings.edgesDiscrete.indexOf(map);
        this.showSingleDeletionDialogue = true;
        break;
      case 'ec':
        this.propertyToRemove.mapReference = this.dataService.networkSelected.mappings.edgesContinuous.indexOf(map);
        this.showSingleDeletionDialogue = true;
        break;
      default:
        this.propertyToRemove = {
          mapType: '',
          attributeName: '',
          mapReference: -1,
          style: null
        };
        this.showSingleDeletionDialogue = false;
        break;

    }
  }

  /**
   * On confirmation the deletion of the mapping or a selected property is executed and
   * instead of the confirmation dialogue the list of
   * existing mappings reappears.
   * When not confirming the deletion merely the dialogue is hidden again.
   *
   * @param confirmation Determines if the deletion is executed or not
   * @param scope Can either be global or single depending on which deletion button was clicked
   */
  confirmDeletion(confirmation: boolean, scope = 'global'): void {

    switch (scope) {
      case 'global':
        if (confirmation) {
          this.dataService.removeMapping(this.mappingToRemove);
          this.selectedMapping = [];

          // hide the gradient or chart currently displayed to avoid confusion
          MainMappingsComponent.mappingsEmitter.emit({
            showGradient: false,
            showChart: false
          });
        }
        this.toggleGlobalRemoveDialogue();

        break;
      case 'single':
        if (confirmation) {
          this.dataService.removePropertyFromMapping(this.dataService.networkSelected.id, this.propertyToRemove);
          this.propertyToRemove = {
            mapReference: -1,
            attributeName: '',
            mapType: '',
            style: null
          };
        }
        this.toggleSingleRemoveDialogue();
        break;
    }
  }

  /**
   * Fetches a list of attributes, which can be used to create a mapping of the specified type for the currently selected network.
   *
   * @param s Can either be 'nd', 'nc', 'ed' or 'ec'
   */
  public getAttributeListForCurrentNetworkAndType(s: string): NeAspect[] {
    const typeHint: NeMappingsType = this.utilityService.getTypeHintByString(s);
    let availableAttributes: NeAspect[];

    if (typeHint.ec || typeHint.ed) {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesEdges;
    } else {
      availableAttributes = this.dataService.networkSelected.aspectKeyValuesNodes;
    }

    if (typeHint.ec || typeHint.nc) {
      availableAttributes = availableAttributes.filter(a => a.datatype === 'integer' || a.datatype === 'float' || a.datatype === 'double');
    } else {
      availableAttributes = availableAttributes.filter(a => a.datatype === 'integer' || a.datatype === 'string' || a.datatype === null);
    }

    return availableAttributes;
  }

  /**
   * Fetches already existing mappings of the specified type and currently selected network.
   *
   * @param s Can either be 'nd', 'nc', 'ed' or 'ec'
   */
  public getExistingMappingListForCurrentNetworkAndType(s: string): NeContinuousCollection[] | NeGroupedMappingsDiscrete[] {
    const typeHint: NeMappingsType = this.utilityService.getTypeHintByString(s);
    const availableMappings = this.dataService.networkSelected.mappings;

    if (typeHint.nd) {
      return availableMappings.nodesDiscrete;
    } else if (typeHint.nc) {
      return availableMappings.nodesContinuous;
    } else if (typeHint.ed) {
      return availableMappings.edgesDiscrete;
    } else if (typeHint.ec) {
      return availableMappings.edgesContinuous;
    }

    return [];
  }
}
