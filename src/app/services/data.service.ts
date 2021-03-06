import {EventEmitter, Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {
  AttributeType,
  EditingObject,
  ElementType,
  MappingType,
  PropertyTarget,
  SidebarMode,
  UtilityService,
  Visibility
} from './utility.service';
import {NeAspect} from '../models/ne-aspect';
import {NeMapping} from '../models/ne-mapping';
import {NeKeyValue} from '../models/ne-key-value';
import {PropertyService} from './property.service';
import {NeSearchResultNetwork} from '../models/ne-search-result-network';
import {NeSearchResultItem} from '../models/ne-search-result-item';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {NeDefault} from '../models/ne-default';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  /**
   * List of networks available to be rendered within the app
   */
  networksParsed: NeNetwork[] = [];
  /**
   * List of networks available in .cx file format
   */
  networksDownloaded: any[] = [];
  /**
   * Selected network of type {@link NeNetwork|NeNetwork}
   */
  selectedNetwork: NeNetwork;
  /**
   * List of networks that are linked to a user's NDEx account.
   * This list is cleared on logout, see {@link AuthService#logout}
   */
  ndexPrivateNetworks: NeSearchResultItem[] = null;
  /**
   * List of networks the user queried before.
   * This list is cleared on logout, see {@link AuthService#logout}
   */
  ndexPublicNetworks: NeSearchResultItem[] = null;
  /**
   * Selected discrete mapping of type {@link NeMappingDiscrete}
   */
  selectedDiscreteMapping: NeMappingDiscrete[];
  /**
   * Selected continuous mapping of type {@link NeMappingContinuous}
   */
  selectedContinuousMapping: NeMappingContinuous[];
  /**
   * Selected passthrough mapping of type {@link NeMapping}
   */
  selectedPassthroughMapping: NeMapping[];
  /**
   * True, if user should not leave the page,
   * e.g. mapping in editing / description in editing
   */
  lockRouting = false;
  /**
   * Mode the sidebar is currently in.
   */
  sidebarMode: SidebarMode = SidebarMode.default;
  /**
   * Object in editing can belong to three types of classes: networkInformation, nodes or edges.
   * Nodes and edges are more specifically defined through {@link objInEditing}.
   * If neither applies, the default class {@link PropertyTarget.none} applies.
   */
  classInEditing: PropertyTarget = PropertyTarget.none;

  /**
   * Specification for the {@link classInEditing}, that is applied to nodes and edges.
   * Defaults to {@link EditingObject.property}, since they cannot be edited.
   */
  objInEditing: EditingObject = EditingObject.property;

  /**
   * Contains the CX file content before the respective mapping went into editing.
   */
  cxBackup: any = null;

  /**
   * Canvas used to display a network
   */
  canvas: HTMLElement;
  /**
   * The network ID increment
   */
  currentNetworkId = -1;

  /**
   * Collection of default styles, defined by JSON files in the assets directory
   */
  defaultStyles: NeDefault | null = null;

  /**
   * Toggle flipping the layout
   */
  flipLayoutEmitter = new EventEmitter<boolean>();
  /**
   * Toggle rebuild of the network's core for rendering
   */
  networkChangedEmitter = new EventEmitter<NeNetwork>();

  constructor(
    private utilityService: UtilityService,
    private propertyService: PropertyService,
    private http: HttpClient,
  ) {
  }

  /**
   * Builds the definition string for a passthrough mapping
   * @param mapping Passthrough mapping to be condensed into a string
   * @private
   */
  private static buildPassthroughMappingDefinition(mapping: NeMapping): string {
    return 'COL=' + mapping.col + ',T=string';
  }

  /**
   * Builds the definition string for a continuous mapping.
   * Please note that we explicitly ignore greater and lower values
   * because they seem to have no impact what so ever on the
   * current network.
   * @param mapping Continuous mapping to be condensed into a string
   */
  private static buildContinuousMappingDefinition(mapping: NeMappingContinuous): string {

    let equals = [];
    let thresholds = [];

    for (let i = 0; i < mapping.equals.length; i++) {
      if (mapping.useValue[i]) {
        equals.push(mapping.equals[i]);

        if (mapping.duplicates[i]?.length > 0) {
          const additionalThresholds = new Array(mapping.duplicates[i].length).fill(mapping.thresholds[i]);
          thresholds = thresholds.concat(additionalThresholds);
          equals = equals.concat(mapping.duplicates[i]);
        }

        thresholds.push(mapping.thresholds[i]);
      }
    }

    let definition = 'COL=' + mapping.col + ',T=' + mapping.type;

    for (let i = 0; i < thresholds.length; i++) {

      definition += ',L=' + i + '=' + equals[i];
      definition += ',E=' + i + '=' + equals[i];
      definition += ',G=' + i + '=' + equals[i];
      definition += ',OV=' + i + '=' + thresholds[i];
    }

    return mapping.newlyAdded ? '*' + definition : definition;
  }

  /**
   * Generates an object based on a list of key value items
   * @param list List of key value items
   * @private
   */
  private static generateObjectFromKeyValue(list: NeKeyValue[]): any {
    const obj: any = {};

    for (const item of list) {
      obj[item.name] = item.value;
    }
    return obj;
  }

  /**
   * Selecting a network
   *
   * @param networkId
   */
  selectNetwork(networkId: number): void {
    this.selectedNetwork = this.networksParsed.find(x => x.id === networkId);
  }

  /**
   * Returns the currently selected network
   */
  getSelectedNetwork(): NeNetwork {
    return this.selectedNetwork;
  }

  /**
   * Returns the default canvas
   */
  getCanvas(): HTMLElement {
    return this.canvas;
  }

  /**
   * Removes a mapping completely
   */
  removeMapping(mapping: NeMapping, elementType: ElementType, mappingType: MappingType): void {
    const cyVisualPropertiesIndex = this.getOrAddCyVisualPropertiesIndex();

    for (const cvp of this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties) {

      if ((elementType === ElementType.node) && cvp.properties_of === 'nodes:default' && cvp.mappings) {

        for (const key of Object.keys(cvp.mappings)) {

          const keyCol = this.utilityService.utilExtractColByMappingString(cvp.mappings[key].definition);
          const keyType = this.utilityService.utilExtractTypeByMapping(cvp.mappings[key].type);

          if (keyCol === mapping.col && keyType === mappingType) {

            if ((mappingType !== MappingType.discrete && mapping.styleProperty === key) || mappingType === MappingType.discrete) {
              delete cvp.mappings[key];
            }
          }
        }

      } else if ((elementType === ElementType.edge) && cvp.properties_of === 'edges:default' && cvp.mappings) {
        for (const key of Object.keys(cvp.mappings)) {

          const keyCol = this.utilityService.utilExtractColByMappingString(cvp.mappings[key].definition);
          const keyType = this.utilityService.utilExtractTypeByMapping(cvp.mappings[key].type);

          if (keyCol === mapping.col && keyType === mappingType) {

            if ((mappingType !== MappingType.discrete && mapping.styleProperty === key) || mappingType === MappingType.discrete) {
              delete cvp.mappings[key];
            }
          }
        }
      }
    }
  }

  /**
   * Adds a discrete mapping to the selected network
   *
   * @param mapping New mapping
   * @param elementType Type of elements this mapping is applied to
   */
  addMappingDiscrete(mapping: NeMappingDiscrete, elementType: ElementType): void {

    if (mapping.mappingType !== MappingType.discrete) {
      console.log('Continuous or passthrough mapping cannot be added as a discrete mapping');
      return;
    }

    const foundCyVisProperties = this.getOrAddCyVisualPropertiesIndex();
    const foundElementVisProperties = this.getOrAddPropertiesIndexByKey(foundCyVisProperties, elementType);

    if (foundCyVisProperties > -1) {
      const entry = this.selectedNetwork.cx[foundCyVisProperties].cyVisualProperties;

      if (foundElementVisProperties > -1) {
        entry[foundElementVisProperties].mappings[mapping.styleProperty] = {
          definition: this.buildDiscreteMappingDefinition(mapping),
          type: 'DISCRETE'
        };
      }
    }
    this.propertyService.handleStyleAdded(mapping.styleProperty);
    this.triggerNetworkCoreBuild(this.selectedNetwork);
  }

  /**
   * Adds a continuous mapping to the selected network
   *
   * @param mapping New mapping
   * @param elementType Either 'node' or 'edge'
   */
  addMappingContinuous(mapping: NeMappingContinuous, elementType: ElementType): void {
    if (mapping.mappingType !== MappingType.continuous) {
      console.log('Discrete or passthrough mapping cannot be added as a continuous mapping');
      return;
    }

    const foundCyVisProperties = this.getOrAddCyVisualPropertiesIndex();
    const foundElementVisProperties = this.getOrAddPropertiesIndexByKey(foundCyVisProperties, elementType);

    if (foundCyVisProperties > -1) {
      const entry = this.selectedNetwork.cx[foundCyVisProperties].cyVisualProperties;

      if (foundElementVisProperties > -1) {
        entry[foundElementVisProperties].mappings[mapping.styleProperty] = {
          definition: DataService.buildContinuousMappingDefinition(mapping),
          type: 'CONTINUOUS'
        };
      }
    }
    this.propertyService.handleStyleAdded(mapping.styleProperty);
    this.triggerNetworkCoreBuild(this.selectedNetwork);
  }

  /**
   * Adds a passthrough mapping to the selected network
   * @param mapping New mapping
   * @param elementType Either 'node' or 'edge'
   */
  addMappingPassthrough(mapping: NeMapping, elementType: ElementType): void {
    if (mapping.mappingType !== MappingType.passthrough) {
      console.log('Discrete or continuous mapping cannot be added as a passthrough mapping');
      return;
    }

    const foundCyVisProperties = this.getOrAddCyVisualPropertiesIndex();
    const foundElementVisProperties = this.getOrAddPropertiesIndexByKey(foundCyVisProperties, elementType);

    if (foundCyVisProperties > -1) {
      const entry = this.selectedNetwork.cx[foundCyVisProperties].cyVisualProperties;

      if (foundElementVisProperties > -1) {
        entry[foundElementVisProperties].mappings[mapping.styleProperty] = {
          definition: DataService.buildPassthroughMappingDefinition(mapping),
          type: 'PASSTHROUGH'
        };
      }
    }
    this.propertyService.handleStyleAdded(mapping.styleProperty);
    this.triggerNetworkCoreBuild(this.selectedNetwork);
  }

  /**
   * Returns the index of the cartesianLayout aspect within this network, or -1 if it cannot be found.
   * @private
   */
  private getCartesianLayoutIndex(): number {
    for (let i = 0; i < this.selectedNetwork.cx.length; i++) {
      if (this.selectedNetwork.cx[i].cartesianLayout) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Applies a layout to a network and rebuilds the core
   */
  applyLayout(withCoreRebuild: boolean = true): void {

    const newNodes = this.selectedNetwork.core.nodes();
    let cartesianLayoutIndex = this.getCartesianLayoutIndex();

    if (cartesianLayoutIndex === -1) {
      this.selectedNetwork.cx = [...this.selectedNetwork.cx, {cartesianLayout: []}];
      cartesianLayoutIndex = this.selectedNetwork.cx.length - 1;
    }

    newNodes.forEach(cyNode => {
      const localNodeIndex = this.selectedNetwork.cx[cartesianLayoutIndex].cartesianLayout.findIndex(a => a.node === cyNode.id());
      if (localNodeIndex === -1) {
        this.selectedNetwork.cx[cartesianLayoutIndex].cartesianLayout.push({
          node: cyNode.id(),
          x: cyNode.position().x,
          y: cyNode.position().y
        });
      } else {
        this.selectedNetwork.cx[cartesianLayoutIndex].cartesianLayout[localNodeIndex].x = cyNode.position().x;
        this.selectedNetwork.cx[cartesianLayoutIndex].cartesianLayout[localNodeIndex].y = cyNode.position().y;
      }
    });

    if (withCoreRebuild) {
      this.triggerNetworkCoreBuild(this.selectedNetwork);
    }
  }

  /**
   * Incrementing the network ID increment and returning it.
   */
  nextId(): number {
    return ++this.currentNetworkId;
  }

  /**
   * Selecting a continuous mapping for edit mode
   * @param mappingCollection list of continuous mappings to a specific property
   */
  selectMappingContinuous(mappingCollection: NeMappingContinuous[]): void {
    this.resetAnyMappingSelection();
    this.selectedContinuousMapping = mappingCollection;
  }

  /**
   * Selecting a discrete mapping for edit mode
   * @param mappingCollection list of discrete mappings to a specific property
   */
  selectMappingDiscrete(mappingCollection: NeMappingDiscrete[]): void {
    this.resetAnyMappingSelection();
    this.selectedDiscreteMapping = mappingCollection;
  }

  /**
   * Resets any mapping selection
   */
  resetAnyMappingSelection(): void {
    this.selectedDiscreteMapping = null;
    this.selectedContinuousMapping = null;
    this.selectedPassthroughMapping = null;
  }

  /**
   * Defines the canvas to be used to render a network
   * @param nativeElement HTML element used as canvas
   */
  setCanvas(nativeElement: any): void {
    if (nativeElement) {
      this.canvas = nativeElement;
    }
  }

  /**
   * Returns a nodeProperty or edgeProperty of type {@link NeAspect}
   * based on the currently selected network.
   * @param col string corresponding to the name of the aspected
   * @param elementType Type of elements
   */
  getPropertyByColName(
    col: string,
    elementType: ElementType
  ): NeAspect {

    if (elementType === ElementType.node) {
      for (const n of this.selectedNetwork.aspectKeyValuesNodes) {
        if (n.name === col) {
          return n;
        }
      }
    } else {
      for (const e of this.selectedNetwork.aspectKeyValuesEdges) {
        if (e.name === col) {
          return e;
        }
      }
    }
  }

  /**
   * Finds the background color for a network within the original .cx file
   */
  getBackgroundColor(): string {
    if (this.selectedNetwork) {
      for (const fd of this.selectedNetwork.cx) {
        if (fd.cyVisualProperties) {
          for (const prop of fd.cyVisualProperties) {
            if (prop.properties_of === 'network') {
              if (prop.properties.NETWORK_BACKGROUND_PAINT) {
                return prop.properties.NETWORK_BACKGROUND_PAINT;
              }
            }
          }
        }
      }
    }
    return '#fff';
  }

  /**
   * Returns a style property's attribute type. That can either be color, numeric or default (string)
   * @param styleProperty Name of the style property
   */
  getAttributeByStyleProperty(styleProperty: string): AttributeType {
    const isColor = PropertyService.colorProperties.includes(styleProperty);
    const isNumeric = PropertyService.continuousProperties.includes(styleProperty);
    const isFontFace = PropertyService.fontFaceProperties.includes(styleProperty);

    return isColor ? this.utilityService.attributeType.color
      : (isNumeric ? this.utilityService.attributeType.numeric
        : (isFontFace ? this.utilityService.attributeType.fontFace : this.utilityService.attributeType.default));
  }

  /**
   * Returns all continuous mappings for the given col
   * @param col The mapping's column
   * @param elementType Points to the type of element in {@link UtilityService#elementType}
   */
  findAllMappingsContinuousByCol(col: string, elementType: ElementType): NeMappingContinuous[] {
    if (elementType === ElementType.node) {
      return this.selectedNetwork.mappings.nodesContinuous.filter(a => a.col === col);
    }
    return this.selectedNetwork.mappings.edgesContinuous.filter(a => a.col === col);
  }

  /**
   * Returns all discrete mappings for the given col
   * @param col The mapping's column
   * @param elementType Points to the type of element in {@link UtilityService#elementType}
   */
  findAllMappingsDiscreteByCol(col: string, elementType: ElementType): NeMappingDiscrete[] {
    if (elementType === ElementType.node) {
      return this.selectedNetwork.mappings.nodesDiscrete.filter(a => a.col === col);
    }
    return this.selectedNetwork.mappings.edgesDiscrete.filter(a => a.col === col);
  }

  /**
   * Returns all passthrough mappings for the given col
   * @param col The mapping's column
   * @param elementType Points to the type of element in {@link UtilityService#elementType}
   */
  findAllMappingsPassthroughByCol(col: string, elementType: ElementType): NeMapping[] {
    if (elementType === ElementType.node) {
      return this.selectedNetwork.mappings.nodesPassthrough.filter(a => a.col === col);
    }
    return this.selectedNetwork.mappings.edgesPassthrough.filter(a => a.col === col);
  }

  /**
   * Deletes all mappings corresponding to a specific col
   * @param col Name of col
   * @param mappingType Type of mapping, either 'passthrough', 'discrete' or 'continuous'
   * @param elementType Type of element, either 'node' or 'edge'
   */
  removeAllMappingsByCol(col: string, mappingType: MappingType, elementType: ElementType): void {
    const start = new Date().getTime();

    let mappings;
    switch (mappingType) {
      case this.utilityService.mappingType.continuous:
        mappings = this.findAllMappingsContinuousByCol(col, elementType);
        break;
      case this.utilityService.mappingType.discrete:
        mappings = this.findAllMappingsDiscreteByCol(col, elementType);
        break;
      case this.utilityService.mappingType.passthrough:
        mappings = this.findAllMappingsPassthroughByCol(col, elementType);
        break;
    }

    for (const mapping of mappings) {
      this.removeMapping(mapping, elementType, mappingType);
    }
    this.triggerNetworkCoreBuild();
    const end = new Date().getTime();

    console.log('Removing mappings by col finished! Duration (ms): ' + (end - start));

  }

  /**
   * Returns a string list of properties for which mappings of a given type are possible for the current network.
   * Already existing mappings can be excluded.
   *
   * @param elementType Type of element, either 'node' or 'edge'
   * @param mappingType Type of mapping, either 'passthrough', 'discrete' or 'continuous'
   * @param includeAlreadyExisting True, if already existing are to be excluded
   */
  findPropertiesForElementAndMappingType(
    elementType: ElementType,
    mappingType: MappingType,
    includeAlreadyExisting: boolean
  ): string[] {
    let baseList: NeAspect[];
    if (elementType === ElementType.edge) {
      baseList = this.selectedNetwork.aspectKeyValuesEdges;
    } else {
      baseList = this.selectedNetwork.aspectKeyValuesNodes;
    }
    if (mappingType === MappingType.continuous) {
      baseList = baseList.filter(a => a.validForContinuous);
    }

    let resultingList = baseList.map(a => a.name);

    if (!includeAlreadyExisting) {
      let existingMappings = [];
      if (elementType === ElementType.edge) {
        switch (mappingType) {
          case MappingType.passthrough:
            existingMappings = this.selectedNetwork.mappings.edgesPassthrough;
            break;
          case MappingType.discrete:
            existingMappings = this.selectedNetwork.mappings.edgesDiscrete;
            break;
          case MappingType.continuous:
            existingMappings = this.selectedNetwork.mappings.edgesContinuous;
            break;
        }
      } else {
        switch (mappingType) {
          case MappingType.passthrough:
            existingMappings = this.selectedNetwork.mappings.nodesPassthrough;
            break;
          case MappingType.discrete:
            existingMappings = this.selectedNetwork.mappings.nodesDiscrete;
            break;
          case MappingType.continuous:
            existingMappings = this.selectedNetwork.mappings.nodesContinuous;
            break;
        }
      }
      existingMappings = existingMappings.map(a => a.col);
      resultingList = resultingList.filter(a => !existingMappings.includes(a));
    }
    return resultingList;
  }

  /**
   * Overrides the current networkAttributes.
   * @param information List of information items
   */
  writeNetworkInformation(information: NeKeyValue[]): void {
    for (const aspect of this.selectedNetwork.cx) {
      if (aspect.networkAttributes) {
        aspect.networkAttributes = [];

        for (const item of information) {
          const obj: any = {
            n: item.name,
            v: item.value
          };

          if (item.datatype) {
            obj.d = item.datatype;
          }

          aspect.networkAttributes.push(obj);
        }
      }
    }
    this.resetObjectInEditing();
    this.selectedNetwork.networkInformation.information = information;
    for (const item of this.selectedNetwork.networkInformation.information) {
      if (item.name === 'name') {
        this.selectedNetwork.networkInformation.name = item.value;
        break;
      }
    }
  }

  /**
   * Overrides default styles for nodes or edges.
   * This method does NOT rebuild the core, unless explicitly specified.
   * @param elementType Indicates if nodes or edges are to be modified
   * @param styles List of properties to be applied
   * @param rebuildCore True, if the core is to be rebuilt after applying default styles.
   */
  writeDefaultStyles(elementType: ElementType, styles: NeKeyValue[], rebuildCore: boolean = false): void {

    const obj = DataService.generateObjectFromKeyValue(styles);

    for (const aspect of this.selectedNetwork.cx) {
      if (aspect.cyVisualProperties) {
        for (const prop of aspect.cyVisualProperties) {

          // override properties, when elementType and properties_of match
          if ((elementType === this.utilityService.elementType.node
              && prop.properties_of === 'nodes:default')
            || (elementType === this.utilityService.elementType.edge
              && prop.properties_of === 'edges:default')) {
            prop.properties = obj;
            break;
          }
        }
      }
    }
    this.resetObjectInEditing();
    if (rebuildCore) {
      this.triggerNetworkCoreBuild();
    }
  }

  /**
   * Overrides specific styles for nodes or edges
   * @param elementType Indicate if nodes or edges are to be modified
   * @param styles List of properties to be applied
   */
  writeSpecificStyles(elementType: ElementType, styles: NeKeyValue[]): void {

    const properties = {};
    for (const style of styles) {
      if (!properties[style.reference]) {
        properties[style.reference] = {};
      }
      const item = {};
      properties[style.reference][style.name] = style.value;
    }

    for (const aspect of this.selectedNetwork.cx) {
      if (aspect.cyVisualProperties) {

        // remove all specific properties for this element type
        aspect.cyVisualProperties = aspect.cyVisualProperties.filter(a => {
          if ((a.properties_of === 'nodes' && elementType === this.utilityService.elementType.node)
            || (a.properties_of === 'edges' && elementType === this.utilityService.elementType.edge)) {
            return false;
          }
          return true;
        });

        // add collection of properties for this element type
        for (const key of Object.keys(properties)) {
          const item = {
            applies_to: key,
            dependencies: {},
            properties: properties[key],
            properties_of: elementType === this.utilityService.elementType.node ? 'nodes' : 'edges'
          };
          aspect.cyVisualProperties.push(item);
        }
      }
    }

    this.resetObjectInEditing();
    this.triggerNetworkCoreBuild();
  }

  /**
   * Overrides network default styles
   * @param styles
   */
  writeNetworkStyles(styles: NeKeyValue[]): void {
    const obj = DataService.generateObjectFromKeyValue(styles);

    for (const aspect of this.selectedNetwork.cx) {
      if (aspect.cyVisualProperties) {
        for (const prop of aspect.cyVisualProperties) {
          if (prop.properties_of === 'network') {
            prop.properties = obj;
            break;
          }
        }
      }
    }
    this.resetObjectInEditing();
    this.triggerNetworkCoreBuild();
  }

  /**
   * Resets the pointer towards the object in editing to default values
   * @private
   */
  resetObjectInEditing(): void {
    this.classInEditing = PropertyTarget.none;
    this.objInEditing = EditingObject.property;
  }

  /**
   * Sets the class and object that are currently edited based on a mapping in editing.
   * Will only be used when a discrete or continuous mapping is being edited,
   * since passthrough mappings are not editable.
   * Will not be used for element independent properties. See {@link setPropertyObjectInEditing} for that purpose.
   * @param elementType Impacts the class that is being edited, e.g. nodes or edges
   * @param mappingType
   */
  setMappingObjectInEditing(elementType: ElementType, mappingType: MappingType): void {
    this.classInEditing = this.utilityService.utilGetPropertyTargetByElementType(elementType);
    this.objInEditing = this.utilityService.utilGetEditingObjectByMappingType(mappingType);
  }

  /**
   * Sets the class and object that are currently edited based on the
   * element independent property that is in editing,
   * e.g. network information or network attributes.
   * Will not be used for mappings. See {@link setMappingObjectInEditing} for that purpose.
   * @param target
   */
  setPropertyObjectInEditing(target: PropertyTarget): void {
    this.classInEditing = target;
    this.objInEditing = EditingObject.property;
  }

  /**
   * During exporting the network as CX file, we remove the NDExStatus, because it is deprecated
   */
  removeNdexStatus(): void {
    let removeAt = -1;
    for (let i = 0; i < this.selectedNetwork.cx.length; i++) {
      const aspect = this.selectedNetwork.cx[i];
      if (aspect.ndexStatus) {
        removeAt = i;
        break;
      }
    }
    if (removeAt !== -1) {
      this.selectedNetwork.cx.splice(removeAt, 1);
    }
  }

  /**
   * Resets an element's aspect back to its defaults
   * @param elementType Points towards nodes or edges
   */
  resetElementAspect(elementType: ElementType): void {

    console.log('RESET ELEMENT: ' + elementType);

    const isNode = elementType === this.utilityService.elementType.node;
    const cyVisualPropertiesIndex = this.getOrAddCyVisualPropertiesIndex();
    const elementIndex = this.getOrAddPropertiesIndexByKey(cyVisualPropertiesIndex, elementType);

    console.log(this.selectedNetwork);

    if (this.defaultStyles === null) {
      this.loadDefaultStyles().subscribe((styles) => {
        this.defaultStyles = styles as NeDefault;
        if (styles !== null) {
          this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties[elementIndex]
            = (isNode ? styles.nodesDefault : styles.edgesDefault);
        }
        // reset element-specific properties
        // reset object in editing
        // trigger core rebuild
        this.writeSpecificStyles(elementType, []);
      });
    } else {
      this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties[elementIndex]
        = (isNode ? this.defaultStyles.nodesDefault : this.defaultStyles.edgesDefault);
      this.writeSpecificStyles(elementType, []);
    }

  }

  /**
   * Loads the default styles defined by JSON files in the assets directory
   * @private
   */
  private loadDefaultStyles(): Observable<NeDefault | null> {
    const pathStyle = environment.pathStyle;
    return forkJoin({
      network: this.http.get(`${pathStyle}network.json`),
      nodesDefault: this.http.get(`${pathStyle}nodes-default.json`),
      edgesDefault: this.http.get(`${pathStyle}edges-default.json`),
    }).pipe(
      map((payload) => {
        return payload;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
   * Returns the default styles
   */
  getDefaultStyles(): Observable<NeDefault | null> {
    if (this.defaultStyles !== null) {
      return of(this.defaultStyles);
    }
    return this.loadDefaultStyles();
  }

  /**
   * Initializes default styles including a node label mapping, if there is a column with 'name'
   */
  initDefaultStyles(): void {
    const addLabelMapping = this.selectedNetwork.aspectKeyValuesNodes.findIndex(a => a.name === 'name');

    const cyVisualPropertiesIndex = this.getOrAddCyVisualPropertiesIndex();
    if (addLabelMapping > -1) {

      if (this.defaultStyles === null) {
        this.loadDefaultStyles().subscribe((styles) => {
          this.defaultStyles = styles as NeDefault;

          if (styles !== null) {
            this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties = Object.values(styles);
          }

          this.triggerNetworkCoreBuild();
        });
      } else {
        this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties = Object.values(this.defaultStyles);
        this.triggerNetworkCoreBuild();
      }


    }
  }

  /**
   * Builds the definition string for a discrete mapping
   * @param mapping Discrete mapping to be condensed into a string
   * @private
   */
  private buildDiscreteMappingDefinition(mapping: NeMappingDiscrete): string {

    let definition = 'COL=' + mapping.col + ',T=' + mapping.type || 'string';
    for (let i = 0; i < mapping.keys.length; i++) {

      if (PropertyService.colorProperties.includes(mapping.styleProperty)
        && !mapping.values[i]
        && mapping.useValue[i]) {
        mapping.values[i] = '#000000';
      }

      if (!!mapping.keys[i]
        && !!mapping.values[i]
        && mapping.values[i] !== ''
        && mapping.useValue[i]) {

        definition += ',K=' + i + '=' + mapping.keys[i];
        definition += ',V=' + i + '=' + mapping.values[i];
      }
    }

    return mapping.newlyAdded ? '*' + definition : definition;
  }

  /**
   * Returns the cyVisualPropertiesIndex or adds the aspect
   * @private
   */
  private getOrAddCyVisualPropertiesIndex(): number {
    let foundCyVisProperties = -1;

    for (let i = 0; i < this.selectedNetwork.cx.length; i++) {
      const entry = this.selectedNetwork.cx[i];
      if (entry.cyVisualProperties) {
        foundCyVisProperties = i;
      }
    }

    if (foundCyVisProperties === -1) {
      this.selectedNetwork.cx.push({
        cyVisualProperties: [
          {
            properties_of: 'network',
            properties: {}
          },
          {
            properties_of: 'nodes:default',
            properties: {},
            dependencies: {},
            mappings: {}
          },
          {
            properties_of: 'edges:default',
            properties: {},
            dependencies: {},
            mappings: {}
          }
        ]
      });
      foundCyVisProperties = this.selectedNetwork.cx.length - 1;
    }
    return foundCyVisProperties;
  }

  /**
   * Returns the index of nodes:default or edges:default aspects
   * @param cyIndex Index of the cyVisualProperties aspect
   * @param elementType Type of element
   * @private
   */
  private getOrAddPropertiesIndexByKey(cyIndex: number, elementType: ElementType): number {
    const key = elementType === this.utilityService.elementType.node ? 'nodes:default' : 'edges:default';
    for (let i = 0; i < this.selectedNetwork.cx[cyIndex].cyVisualProperties.length; i++) {
      const obj = this.selectedNetwork.cx[cyIndex].cyVisualProperties[i];
      if (obj.properties_of === key) {
        return i;
      }
    }
    this.selectedNetwork.cx[cyIndex].cyVisualProperties.push({
      properties_of: key,
      properties: {},
      mappings: {},
      dependencies: {}
    });
    return this.selectedNetwork.cx[cyIndex].cyVisualProperties.length - 1;
  }

  /**
   * Emits the currently changed network
   * @private
   */
  private triggerNetworkCoreBuild(network: NeNetwork = null): void {
    console.log('emitting new network ...');
    if (network === null) {
      this.networkChangedEmitter.emit(this.selectedNetwork);
      return;
    }
    this.networkChangedEmitter.emit(network);
  }

  /**
   * Handles the data received as a result from search requests.
   * @param data Payload
   * @param visibility Private for a private search, public for a public search
   * @param elementLimit Maximum number of elements for nodes or edges. If this is exceeded, we assume that network is too big for NDExEdit to handle.
   */
  handleSearchData(data: NeSearchResultNetwork, visibility: Visibility, elementLimit: number): boolean {

    if (data.numFound === 0) {
      return false;
    }

    data.networks.forEach((network) => {
      network.downloadable = network.nodeCount < elementLimit && network.edgeCount < elementLimit;
      network.writable = false;
      network.checkedPermission = false;
    });

    if (visibility === Visibility.private) {
      this.ndexPrivateNetworks = data.networks;
    } else {
      this.ndexPublicNetworks = data.networks;
    }

    return true;
  }

  /**
   * Handles the data received as a result from browse requests.
   * @param data Payload
   * @param elementLimit Maximum number of elements for nodes or edges. If this is exceeded, we assume that network is too big for NDExEdit to handle.
   */
  handleBrowseData(data: NeSearchResultItem[], elementLimit: number): boolean {
    if (data.length === 0) {
      return false;
    }

    data.forEach((network) => {
      network.downloadable = network.nodeCount < elementLimit && network.edgeCount < elementLimit;
      network.writable = false;
      network.checkedPermission = false;
    });

    this.ndexPrivateNetworks = data;
    return true;
  }

  /**
   * Overrides the core by using the backed-up CX.
   */
  overrideCx(): void {
    if (this.cxBackup) {
      this.sidebarMode = SidebarMode.default;
      this.selectedNetwork.cx = this.cxBackup;
      this.cxBackup = null;
      this.triggerNetworkCoreBuild();
    } else {
      console.log('Failed to override core!');
    }
  }

  /**
   * Store the CX as a deep copy to use during discarding changes.
   */
  storeCxBackup(): void {
    this.cxBackup = JSON.parse(JSON.stringify(this.selectedNetwork.cx));
  }

  /**
   * To abort during adding a mapping collection, we have to make sure, that the shallow mapping object
   * is removed from the CX file.
   * @param newVisualProperty Name of the mapping's style property, that serves as a key within the mappings object
   * @param elementType Type of element
   */
  storeCxBackupWithoutNew(newVisualProperty: string, elementType: ElementType): void {
    for (const item of this.selectedNetwork.cx) {
      if (item.cyVisualProperties) {
        for (const cvp of item.cyVisualProperties) {
          if (cvp.properties_of === (elementType === ElementType.node ? 'nodes:default' : 'edges:default')) {
            if (cvp.mappings) {
              for (const key of Object.keys(cvp.mappings)) {
                if (key === newVisualProperty) {
                  delete cvp.mappings[key];
                  this.storeCxBackup();
                  return;
                }
              }
            }
          }
        }
      }
    }
  }
}
