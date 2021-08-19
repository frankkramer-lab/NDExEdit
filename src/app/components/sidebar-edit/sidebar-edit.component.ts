import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {
  faArrowLeft,
  faCheck,
  faChevronDown,
  faCogs,
  faEdit,
  faHome,
  faLightbulb,
  faLock,
  faMagic,
  faPalette,
  faPlus,
  faSearch,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import {NeMappingDiscrete} from '../../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../../models/ne-mapping-continuous';
import {ElementType, MappingType, UtilityService} from '../../services/utility.service';
import {LayoutService} from '../../services/layout.service';
import {NeMapping} from '../../models/ne-mapping';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {elementPropertyValidator} from '../../validators/element-property.directive';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {stylePropertyValidator} from '../../validators/style-property.directive';

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
   * Icon: faLock
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faLock = faLock;
  /**
   * Icon: faHome
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faHome = faHome;
  /**
   * Icon: faChevronDown
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronDown = faChevronDown;
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
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
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
   * Icon: faSearch
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSearch = faSearch;
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
   * Icon: faLightbulb
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faLightbulb = faLightbulb;
  /**
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;

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
  isCollapsedDescription = false;
  /**
   * True, if node mappings are collapsed
   */
  isCollapsedMappingsNodes = false;
  /**
   * True, if edge mappings are collapsed
   */
  isCollapsedMappingsEdges = false;
  /**
   * List of continuous edge mappings to be deleted
   */
  ecForDeletion: NeMappingContinuous[] = [];
  /**
   * List of continuous node mappings to be deleted
   */
  ncForDeletion: NeMappingContinuous[] = [];
  /**
   * List of discrete edge mappings to be deleted
   */
  edForDeletion: NeMappingDiscrete[] = [];
  /**
   * List of discrete node mappings to be deleted
   */
  ndForDeletion: NeMappingDiscrete[] = [];
  /**
   * List of passthrough node mappings to be deleted
   */
  npForDeletion: NeMapping[] = [];
  /**
   * List of passthrough edge mappings to be deleted
   */
  epForDeletion: NeMapping[] = [];
  /**
   * Form to add a continuous edge mapping
   */
  newEdgeCollectionForm: FormGroup;
  /**
   * Form to add a continuous node mapping
   */
  newNodeCollectionForm: FormGroup;
  /**
   * Number indicating how many collections currently are in flashmode.
   * Should be alternating between 0 and 1, since we have to untoggle flashmode to continue.
   * Updated by responding to their respective emitters
   * {@link SidebarEditMappingDiscreteComponent#flashMode}
   * {@link SidebarEditMappingContinuousComponent#flashMode}
   */
  childrenInEditing = 0;

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

  ngOnInit(): void {
    this.newEdgeCollectionForm = new FormGroup({
      property: new FormControl(null, [
        Validators.required
      ]),
      styleProperty: new FormControl(null),
      type: new FormControl(null, Validators.required)
    });

    this.newNodeCollectionForm = new FormGroup({
      property: new FormControl(null, [
        Validators.required
      ]),
      styleProperty: new FormControl(null),
      type: new FormControl(null, Validators.required)
    });

    this.initCollectionForm(this.newEdgeCollectionForm, ElementType.edge);
    this.initCollectionForm(this.newNodeCollectionForm, ElementType.node);
  }

  /**
   * Initializes a both node and edge collection forms
   * @param form either node or edge collection form
   * @param elementType type of element the form corresponds to
   * @private
   */
  private initCollectionForm(form: FormGroup, elementType: ElementType): void {
    form.get('styleProperty').setValidators([
      stylePropertyValidator(elementType, form.get('type').value, []),
      Validators.required
    ]);

    form.get('type').valueChanges.subscribe(selection => {
      this.updatePropertyValidator(elementType, selection);
    });
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
   * Toggles labels by using a specific CSS class which overrides the values of the labels
   * @param show Determines if labels are to be displayed
   */
  toggleLabels(show: boolean): void {
    this.graphService.toggleLabels(show);
    this.dataService.getSelectedNetwork().showLabels = show;
  }

  /**
   * Overrides the network's style property with the given color codes, duration will be reset if the view is
   * destroyed and reinitialized, because this is not stored within the network
   */
  setHighlightColorAndDuration(): void {
    this.graphService.setHighlightColorAndDuration(this.highlightNodes, this.highlightEdges, this.highlightDuration);
  }

  /**
   * Deletes a whole mapping collection for all nodes or for all edges
   */
  deleteMappingCollectionsByElementType(elementType: ElementType): void {
    if (elementType === ElementType.node) {
      const nodeMappings: NeMapping[] = this.npForDeletion.concat(this.ndForDeletion).concat(this.ncForDeletion);
      for (const mapping of nodeMappings) {
        this.dataService.removeAllMappingsByCol(mapping.col, mapping.mappingType, ElementType.node);
      }
      this.npForDeletion = [];
      this.ndForDeletion = [];
      this.ncForDeletion = [];
    } else {
      const edgeMappings: NeMapping[] = this.epForDeletion.concat(this.edForDeletion).concat(this.ecForDeletion);
      for (const mapping of edgeMappings) {
        this.dataService.removeAllMappingsByCol(mapping.col, mapping.mappingType, ElementType.edge);
      }
      this.epForDeletion = [];
      this.edForDeletion = [];
      this.ecForDeletion = [];
    }
  }

  /**
   * Suggests style properties for a new mapping collection.
   * Excluding properties for which already exists a mapping of the selected type
   * and unsuitable properties, e.g. shape properties to be mapped as a continuous mapping.
   * @param elementType either 'node' or 'edge'
   * @param isContinuous boolean value indicating if this mapping is going to be continuous or not
   */
  suggestStyleProperties(elementType: ElementType, isContinuous: boolean): (text: Observable<string>) => Observable<readonly string[]> {
    return (text$: Observable<string>) => {
      let available = (elementType === ElementType.edge) ? DataService.edgeProperties : DataService.nodeProperties;
      if (isContinuous) {
        available = available.filter(a => DataService.continuousProperties.includes(a));
      }

      return text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term === '*' ? available : term.length < 1 ? []
          : available.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
      );
    };
  }

  /**
   * Suggests element's property which is used in a mapping. Excludes properties for which a mapping of the
   * specified type already exists.
   * @param elementType either 'node' or 'edge'
   * @param mappingType either 'continuous', 'discrete' or 'passthrough'
   */
  suggestProperties(elementType: ElementType, mappingType: MappingType): (text: Observable<string>) => Observable<readonly string[]> {
    return (text$: Observable<string>) => {
      const available = this.dataService.findPropertiesForElementAndMappingType(elementType, mappingType, false);

      return text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term === '*' ? available : term.length < 1 ? []
          : available.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
      );
    };
  }

  /**
   * Adds a continuous mapping collection
   * @param elementType Type of element, either 'node' or 'edge'
   * @private
   */
  private handleNewContinuous(elementType: ElementType): void {
    let aspect;
    let form;
    if (elementType === ElementType.node) {
      form = this.newNodeCollectionForm;
      aspect = this.dataService.selectedNetwork.aspectKeyValuesNodes
        .find(a => a.name === form.get('property').value);
    } else {
      form = this.newEdgeCollectionForm;
      aspect = this.dataService.selectedNetwork.aspectKeyValuesEdges
        .find(a => a.name === form.get('property').value);
    }

    const newMapping: NeMappingContinuous = {
      chart: null,
      col: aspect.name,
      type: aspect.datatype,
      colorGradient: null,
      duplicates: [],
      equals: [],
      greaters: [],
      isColor: false,
      lowers: [],
      mappingType: MappingType.continuous,
      styleProperty: form.get('styleProperty').value,
      thresholds: [],
      useValue: [],
      newlyAdded: true
    };
    this.dataService.addMappingContinuous(newMapping, elementType);
    form.reset();
    this.dataService.selectedContinuousMapping = this.dataService.findAllMappingsContinuousByCol(aspect.name, elementType);

  }

  /**
   * Adds a discrete mapping collection
   * @param elementType Type of element, either 'node' or 'edge'
   * @private
   */
  private handleNewDiscrete(elementType: ElementType): void {
    let aspect;
    let form;
    if (elementType === ElementType.node) {
      form = this.newNodeCollectionForm;
      aspect = this.dataService.selectedNetwork.aspectKeyValuesNodes
        .find(a => a.name === form.get('property').value);
    } else {
      form = this.newEdgeCollectionForm;
      aspect = this.dataService.selectedNetwork.aspectKeyValuesEdges
        .find(a => a.name === form.get('property').value);
    }

    const newMapping: NeMappingDiscrete = {
      col: aspect.name,
      keys: aspect.values,
      mapObject: [],
      mappingType: MappingType.discrete,
      styleProperty: form.get('styleProperty').value,
      type: aspect.datatype,
      useValue: [],
      values: [],
      newlyAdded: true
    };

    this.dataService.addMappingDiscrete(newMapping, elementType);
    form.reset();
    this.dataService.selectedDiscreteMapping = this.dataService.findAllMappingsDiscreteByCol(aspect.name, elementType);
  }

  /**
   * Submitting a new mapping collection
   * @param elementType 'node' or 'edge'
   */
  onSubmitNewMappingCollection(elementType: ElementType): void {
    if (elementType === ElementType.edge) {
      switch (this.newEdgeCollectionForm.get('type').value) {
        case MappingType.discrete:
          this.handleNewDiscrete(elementType);
          break;
        case MappingType.passthrough:
          break;
        case MappingType.continuous:
          this.handleNewContinuous(elementType);
          break;
      }
    } else {
      switch (this.newNodeCollectionForm.get('type').value) {
        case MappingType.discrete:
          this.handleNewDiscrete(elementType);
          break;
        case MappingType.passthrough:
          break;
        case MappingType.continuous:
          this.handleNewContinuous(elementType);
          break;
      }
    }
  }

  /**
   * Updates the validator to check for the currently taken properties
   * @param elementType Type of element, either 'node' or 'edge'
   * @param mappingType Type of mapping, either 'passthrough', 'discrete' or 'continuous'
   * @private
   */
  private updatePropertyValidator(elementType: ElementType, mappingType: MappingType): void {
    const available = this.dataService.findPropertiesForElementAndMappingType(elementType, mappingType, false);
    if (elementType === ElementType.node) {
      this.newNodeCollectionForm.get('property').setValidators([
        Validators.required,
        elementPropertyValidator(available)
      ]);
    } else {
      this.newEdgeCollectionForm.get('property').setValidators([
        Validators.required,
        elementPropertyValidator(available)
      ]);
    }
  }

  /**
   * Marks a mapping collection to be deleted, used for all element types and mapping types
   * @param col Name of the column that aggregates the collection
   * @param elementType Type of element, either 'node' or 'edge'
   * @param mappingType Type of mapping, either 'passthrough', 'discrete' or 'continuous'
   */
  markForDeletion(col: string, elementType: ElementType, mappingType: MappingType): void {

    if (elementType === ElementType.node) {
      switch (mappingType) {
        case MappingType.passthrough:
          const npBaseList = this.npForDeletion.map(a => a.col);
          if (npBaseList.includes(col)) {
            this.npForDeletion = this.npForDeletion.filter(a => a.col !== col);
          } else {
            this.npForDeletion = this.npForDeletion.concat(this.dataService.findAllMappingsPassthroughByCol(col, elementType));
          }
          break;
        case MappingType.discrete:
          const ndBaseList = this.ndForDeletion.map(a => a.col);
          if (ndBaseList.includes(col)) {
            this.ndForDeletion = this.ndForDeletion.filter(a => a.col !== col);
          } else {
            this.ndForDeletion = this.ndForDeletion.concat(this.dataService.findAllMappingsDiscreteByCol(col, elementType));
          }
          break;
        case MappingType.continuous:
          const ncBaseList = this.ncForDeletion.map(a => a.col);
          if (ncBaseList.includes(col)) {
            this.ncForDeletion = this.ncForDeletion.filter(a => a.col !== col);
          } else {
            this.ncForDeletion = this.ncForDeletion.concat(this.dataService.findAllMappingsContinuousByCol(col, elementType));
          }
          break;
      }
    } else {
      switch (mappingType) {
        case MappingType.passthrough:
          const epBaseList = this.epForDeletion.map(a => a.col);
          if (epBaseList.includes(col)) {
            this.epForDeletion = this.epForDeletion.filter(a => a.col !== col);
          } else {
            this.epForDeletion = this.epForDeletion.concat(this.dataService.findAllMappingsPassthroughByCol(col, elementType));
          }
          break;
        case MappingType.discrete:
          const edBaseList = this.edForDeletion.map(a => a.col);
          if (edBaseList.includes(col)) {
            this.edForDeletion = this.edForDeletion.filter(a => a.col !== col);
          } else {
            this.edForDeletion = this.edForDeletion.concat(this.dataService.findAllMappingsDiscreteByCol(col, elementType));
          }
          break;
        case MappingType.continuous:
          const ecBaseList = this.ecForDeletion.map(a => a.col);
          if (ecBaseList.includes(col)) {
            this.ecForDeletion = this.ecForDeletion.filter(a => a.col !== col);
          } else {
            this.ecForDeletion = this.ecForDeletion.concat(this.dataService.findAllMappingsContinuousByCol(col, elementType));
          }
          break;
      }
    }
  }

  /**
   * Handles this component's children's flashmode for editing existing mappings
   * @param inFlashMode True, if a child is entering flashmode, false else
   */
  handleChildFlashMode(inFlashMode: boolean): void {
    if (inFlashMode) {
      this.childrenInEditing++;
      this.newEdgeCollectionForm.disable();
      this.newNodeCollectionForm.disable();
    } else {
      this.childrenInEditing--;
      this.newEdgeCollectionForm.enable();
      this.newNodeCollectionForm.enable();
    }
  }
}
