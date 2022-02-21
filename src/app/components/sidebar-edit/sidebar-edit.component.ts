import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {
  faArrowLeft,
  faCheck,
  faChevronRight,
  faCloudDownloadAlt,
  faCogs,
  faCopy,
  faExclamationTriangle,
  faHome,
  faInfoCircle,
  faLock,
  faLockOpen,
  faMagic,
  faPalette,
  faPlus,
  faRedo,
  faTimes,
  faTrash,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import {UtilityService} from '../../services/utility.service';
import {LayoutService} from '../../services/layout.service';
import {FormArray, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})

/**
 * Component responsible for graph editing functionality
 */
export class SidebarEditComponent implements OnInit, OnDestroy {
  /**
   * Icon: faHome
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faHome = faHome;
  /**
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;
  /**
   * Icon: faChevronRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronRight = faChevronRight;
  /**
   * Icon: faExclamationTriangle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExclamationTriangle = faExclamationTriangle;
  /**
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Icon: faLockOpen
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faLockOpen = faLockOpen;

  /**
   * Icon: faLock
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faLock = faLock;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
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
   * Icon: faPalette
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPalette = faPalette;
  /**
   * Icon: faInfoCircle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faInfoCircle = faInfoCircle;
  /**
   * Icon: faCloudDownloadAlt
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCloudDownloadAlt = faCloudDownloadAlt;
  /**
   * Icon: faCopy
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCopy = faCopy;
  /**
   * Toggles displaying the checkbox where the labels may be toggled
   */
  showLabelCheckbox = true;
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
   * True, if description is collapsed
   */
  collapsedEditInfoDescription = false;
  /**
   * True, if attributes are collapsed
   */
  collapsedEditInfoAttributes = true;
  /**
   * True, if inspection wizard is collapsed
   */
  collapsedEditInfoInspection = true;
  /**
   * True, if network information is collapsed
   */
  collapsedNetwork = true;

  /**
   * Collection of input fields for a network's attributes
   */
  descriptionForm: FormGroup;

  /**
   * Ensures that only a graph is rendered if the id is specified within the URL
   * @private
   */
  private readonly routerSubscription: Subscription;

  /**
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param dataService Service to read and write globally accessible data
   * @param route Service to read URL
   * @param graphService Service for graph manipulations
   * @param utilityService Service responsible for shared code
   * @param layoutService Service responsible for tooltip directions
   */
  constructor(
    public dataService: DataService,
    private route: ActivatedRoute,
    public graphService: GraphService,
    public utilityService: UtilityService,
    public layoutService: LayoutService
  ) {

    this.routerSubscription = this.route.paramMap.subscribe(params => {
      const networkId = params.get('id');
      if (networkId) {
        dataService.selectNetwork(Number(networkId));
      }
    });
  }

  /**
   * Returns the items for the description form
   */
  get items(): FormArray {
    return this.descriptionForm.get('items') as FormArray;
  }

  ngOnInit(): void {
  }

  /**
   * Unsets initialized status and restores default values
   */
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.showLabelCheckbox = true;
    this.dataService.selectedNetwork.core.elements().unselect();
    this.graphService.selectedElements.nodes = [];
    this.graphService.selectedElements.edges = [];

  }

  /**
   * Overrides the network's style property with the given color codes, duration will be reset if the view is
   * destroyed and reinitialized, because this is not stored within the network
   */
  setHighlightColorAndDuration(): void {
    this.graphService.setHighlightColorAndDuration(this.highlightNodes, this.highlightEdges, this.highlightDuration);
  }

  /**
   * Copies this network's UUID to the clipboard
   */
  copyUuid(): void {
    if (this.dataService.selectedNetwork.networkInformation.uuid) {
      navigator.clipboard.writeText(this.dataService.selectedNetwork.networkInformation.uuid);
    }
  }


}


