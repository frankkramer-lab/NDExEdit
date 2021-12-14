import {EventEmitter, Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {AttributeType, ElementType, MappingType, UtilityService} from './utility.service';
import {NeAspect} from '../models/ne-aspect';
import {NeMapping} from '../models/ne-mapping';
import {NeKeyValue} from '../models/ne-key-value';
import {NeEditItem} from '../models/ne-edit-item';
import {PropertyService} from './property.service';

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
   * Contains information about an object which is currently being edited.
   * Can either be a mapping or a list of properties.
   */
  objInEditing: NeEditItem = {
    elementType: null,
    mappingType: null,
    nwInfo: false,
    nwVisuals: false
  };
  /**
   * Canvas used to display a network
   */
  canvas: HTMLElement;
  /**
   * The network ID increment
   */
  currentNetworkId = -1;
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
    private propertyService: PropertyService
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
    this.selectedNetwork.networkInformation.information = information;
  }

  /**
   * Overrides default styles for nodes or edges
   * @param elementType Indicates if nodes or edges are to be modified
   * @param styles List of properties to be applied
   */
  writeDefaultStyles(elementType: ElementType, styles: NeKeyValue[]): void {

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
    this.objInEditing.elementType = null;
    this.objInEditing.mappingType = null;
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
    this.objInEditing.elementType = null;
    this.objInEditing.mappingType = null;
    this.triggerNetworkCoreBuild();
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
    const isNode = elementType === this.utilityService.elementType.node;

    const cyVisualPropertiesIndex = this.getOrAddCyVisualPropertiesIndex();
    for (const item of this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties) {
      if (item.properties_of === (isNode ? 'nodes:default' : 'edges:default')) {
        item.properties = {};
        item.dependencies = {};
        if (!isNode) {
          item.dependencies.arrowColorMatchesEdge = 'true';
        }
        let labelMapping = null;

        if (isNode) {
          for (const key of Object.keys(item.mappings)) {
            if (key === 'NODE_LABEL') {
              labelMapping = item.mappings[key];
              break;
            }
          }
          if (labelMapping !== null) {
            item.mappings = {
              NODE_LABEL: labelMapping
            };
          } else {
            item.mappings = {};
          }
        } else {
          item.mappings = {};
        }
      }
    }
    this.objInEditing.mappingType = null;
    this.objInEditing.elementType = null;
    this.triggerNetworkCoreBuild();
  }

  /**
   * Initializes default styles including a node label mapping, if there is a column with 'name'
   */
  initDefaultStyles(): void {

    const addLabelMapping = this.selectedNetwork.aspectKeyValuesNodes.findIndex(a => a.name === 'name');

    const cyVisualPropertiesIndex = this.getOrAddCyVisualPropertiesIndex();
    if (addLabelMapping > -1) {
      for (const item of this.selectedNetwork.cx[cyVisualPropertiesIndex].cyVisualProperties) {
        if (item.properties_of === 'nodes:default') {
          item.mappings = {
            NODE_LABEL: {
              definition: 'COL=name,T=string',
              type: 'PASSTHROUGH'
            }
          };
        }
      }
    }
    this.selectedNetwork.hasCyViualProperties = true;
    this.triggerNetworkCoreBuild();
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
    if (network === null) {
      this.networkChangedEmitter.emit(this.selectedNetwork);
      return;
    }
    this.networkChangedEmitter.emit(network);
  }
}
