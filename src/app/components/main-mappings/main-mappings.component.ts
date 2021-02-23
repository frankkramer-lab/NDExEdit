import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowLeft, faCheck, faEdit, faPlus, faSearch, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';
import {NeMappingsType} from '../../models/ne-mappings-type';
import {NeAspect} from '../../models/ne-aspect';
import {UtilityService} from '../../services/utility.service';
import {NeMappingDiscrete} from '../../models/ne-mapping-discrete';
import {NeMappingPassthrough} from '../../models/ne-mapping-passthrough';
import {NeMappingContinuous} from '../../models/ne-mapping-continuous';

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
   * Can be one of the following types:
   * <ul>
   *   <li><b>nd</b>: discrete node mapping</li>
   *   <li><b>nc</b>: continuous node mapping</li>
   *   <li><b>np</b>: passthrough node mapping</li>
   *   <li><b>ed</b>: discrete edge mapping</li>
   *   <li><b>ec</b>: continuous edge mapping</li>
   *   <li><b>ep</b>: passthrough edge mapping</li>
   * </ul>
   */
  typeHint: NeMappingsType;

  /**
   * Index pointing to position of a mapping within the corresponding list of mappings
   */
  mapId: string;

  /**
   * Without any numeric index, only string based representation of the typehint
   */
  mapHint: string;

  /**
   * The URL rendering this view contains both the specified graph and a mapping whose details are displayed.
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

      const mapHint = params.get('mapHint');
      const mapId = params.get('mapId');
      const col = params.get('col');

      if (mapHint !== null && col !== null) {
        // discrete mapping
        this.mapHint = mapHint;
        this.dataService.selectMapping(mapHint, col);
      } else if (mapId !== '-1') {
        // continuous or passthrough mapping
        this.mapId = mapId;
        this.dataService.selectMapping(null, null, mapId);
      } else {
        // general overview (mapId === '-1')
        this.dataService.resetAnyMappingSelection();
        this.dataService.resetDiscreteMappingPropertySelection();
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
    this.showSingleDeletionDialogue = false;
    this.showGlobalDeletionDialogue = false;
    this.dataService.resetAnyMappingSelection();
    this.dataService.resetDiscreteMappingPropertySelection();
  }

  /**
   * Toggles a global remove dialogue
   */
  toggleGlobalRemoveDialogue(): void {
    if (!(this.dataService.selectedDiscreteMapping || this.dataService.selectedContinuousMapping || this.dataService.selectedPassthroughMapping)) {
      console.log('No mapping selected which could be deleted!');
    }
    this.dataService.selectPropertyForDeletion();
    this.showSingleDeletionDialogue = false;
    this.showGlobalDeletionDialogue = true;
  }

  /**
   * Dialog toggle:
   * Remove discrete by specific style.
   * May only be used for discrete mappings
   *
   * @param styleIndex Points to the style to be removed
   */
  toggleRemoveDiscreteSingle(styleIndex: number): void {
    if (!this.dataService.selectedDiscreteMapping) {
      console.log('No discrete mapping selected!');
    }
    this.dataService.selectPropertyForDeletion(styleIndex);
    this.showSingleDeletionDialogue = true;
    this.showGlobalDeletionDialogue = false;
  }

  /**
   * Confirms or denies a global deletion of a mapping
   * @param confirmed true, if deletion is to be executed
   */
  confirmDeletionGlobal(confirmed: boolean): void {
    if (confirmed && (this.dataService.selectedDiscreteMapping
      || this.dataService.selectedContinuousMapping
      || this.dataService.selectedPassthroughMapping)) {
      this.dataService.removeMapping();

      MainMappingsComponent.mappingsEmitter.emit({
        showGradient: false,
        showChart: false
      });
    }

    this.showGlobalDeletionDialogue = false;
    this.showSingleDeletionDialogue = false;
  }

  /**
   * Confirms or denies a single deletion of a mapping's property
   * @param confirmed true, if deletion is to be executed
   */
  confirmDeletionSingle(confirmed: boolean): void {
    if (confirmed) {
      this.dataService.removePropertyFromMapping();
    }
    this.showSingleDeletionDialogue = false;
    this.showGlobalDeletionDialogue = false;
  }

  /**
   * Fetches a list of attributes, which can be used to create a mapping of the specified type for the currently selected network.
   *
   * @param s Can either be 'nd', 'nc', 'np', 'ed', 'ec' or 'ep'
   */
  public getAttributeListForCurrentNetworkAndType(s: string): NeAspect[] {
    const typeHint: NeMappingsType = this.utilityService.utilGetTypeHintByString(s);
    let baseList: NeAspect[];

    if (typeHint.nd || typeHint.nc || typeHint.np) {
      baseList = this.dataService.selectedNetwork.aspectKeyValuesNodes;
    } else if (typeHint.ed || typeHint.ec || typeHint.ep) {
      baseList = this.dataService.selectedNetwork.aspectKeyValuesEdges;
    }

    if (typeHint.nc || typeHint.ec) {
      return baseList.filter(a => a.datatype === 'double' || a.datatype === 'float' || a.datatype === 'integer');
    } else if (typeHint.nd || typeHint.ed) {
      return baseList.filter(a => a.datatype === 'string' || a.datatype === 'integer');
    } else {
      return baseList; // assuming all attributes are valid for a passthrough mapping
    }
  }

  /**
   * Fetches already existing mappings of the specified type and currently selected network.
   *
   * @param s Can either be 'nd', 'nc', 'np', 'ed', 'ec' or 'ep'
   */
  public getExistingMappingListForCurrentNetworkAndType(s: string):
    NeMappingContinuous[] |
    NeMappingDiscrete[] |
    NeMappingPassthrough[] {
    const typeHint: NeMappingsType = this.utilityService.utilGetTypeHintByString(s);
    const availableMappings = this.dataService.selectedNetwork.mappings;

    if (typeHint.nd) {
      return availableMappings.nodesDiscrete;
    } else if (typeHint.nc) {
      return availableMappings.nodesContinuous;
    } else if (typeHint.ed) {
      return availableMappings.edgesDiscrete;
    } else if (typeHint.ec) {
      return availableMappings.edgesContinuous;
    } else if (typeHint.np) {
      return availableMappings.nodesPassthrough;
    } else if (typeHint.ep) {
      return availableMappings.edgesPassthrough;
    }

    return [];
  }

}
