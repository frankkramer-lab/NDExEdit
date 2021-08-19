import {EventEmitter, Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {AttributeType, ElementType, MappingType, UtilityService} from './utility.service';
import {NeMappingsType} from '../models/ne-mappings-type';
import {NeAspect} from '../models/ne-aspect';
import {LayoutService} from './layout.service';
import {NeThresholdMap} from '../models/ne-threshold-map';
import {NeMapping} from '../models/ne-mapping';
import {LayoutOptions} from 'cytoscape';

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  constructor(
    private utilityService: UtilityService,
    private layoutService: LayoutService
  ) {

    layoutService.layoutEmitter.subscribe(layout => {
      this.triggerChartRedraw();
    });
  }

  static readonly continuousProperties = [
    'COMPOUND_NODE_PADDING',
    'NODE_BORDER_PAINT',
    'NODE_BORDER_TRANSPARENCY',
    'NODE_BORDER_WIDTH',
    'NODE_CUSTOMGRAPHICS_SIZE_1',
    'NODE_CUSTOMGRAPHICS_SIZE_2',
    'NODE_CUSTOMGRAPHICS_SIZE_3',
    'NODE_CUSTOMGRAPHICS_SIZE_4',
    'NODE_CUSTOMGRAPHICS_SIZE_5',
    'NODE_CUSTOMGRAPHICS_SIZE_6',
    'NODE_CUSTOMGRAPHICS_SIZE_7',
    'NODE_CUSTOMGRAPHICS_SIZE_8',
    'NODE_CUSTOMGRAPHICS_SIZE_9',
    'NODE_CUSTOMPAINT_1',
    'NODE_CUSTOMPAINT_2',
    'NODE_CUSTOMPAINT_3',
    'NODE_CUSTOMPAINT_4',
    'NODE_CUSTOMPAINT_5',
    'NODE_CUSTOMPAINT_6',
    'NODE_CUSTOMPAINT_7',
    'NODE_CUSTOMPAINT_8',
    'NODE_CUSTOMPAINT_9',
    'NODE_DEPTH',
    'NODE_FILL_COLOR',
    'NODE_HEIGHT',
    'NODE_LABEL_COLOR',
    'NODE_LABEL_FONT_SIZE',
    'NODE_LABEL_TRANSPARENCY',
    'NODE_LABEL_WIDTH',
    'NODE_PAINT',
    'NODE_SELECTED',
    'NODE_SELECTED_PAINT',
    'NODE_SIZE',
    'NODE_TRANSPARENCY',
    'NODE_WIDTH',
    'NODE_X_LOCATION',
    'NODE_Y_LOCATION',
    'NODE_Z_LOCATION',
    'EDGE_LABEL_COLOR',
    'EDGE_LABEL_FONT_SIZE',
    'EDGE_LABEL_TRANSPARENCY',
    'EDGE_LABEL_WIDTH',
    'EDGE_PAINT',
    'EDGE_SELECTED',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SIZE',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_SIZE',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_TRANSPARENCY',
    'EDGE_UNSELECTED_PAINT',
    'EDGE_WIDTH'
  ];
  /**
   * List of known node properties
   */
  static readonly nodeProperties = [
    'COMPOUND_NODE_PADDING',
    'COMPOUND_NODE_SHAPE',
    'NODE_BORDER_PAINT',
    'NODE_BORDER_STROKE',
    'NODE_BORDER_TRANSPARENCY',
    'NODE_BORDER_WIDTH',
    'NODE_CUSTOMGRAPHICS_1',
    'NODE_CUSTOMGRAPHICS_2',
    'NODE_CUSTOMGRAPHICS_3',
    'NODE_CUSTOMGRAPHICS_4',
    'NODE_CUSTOMGRAPHICS_5',
    'NODE_CUSTOMGRAPHICS_6',
    'NODE_CUSTOMGRAPHICS_7',
    'NODE_CUSTOMGRAPHICS_8',
    'NODE_CUSTOMGRAPHICS_9',
    'NODE_CUSTOMGRAPHICS_POSITION_1',
    'NODE_CUSTOMGRAPHICS_POSITION_2',
    'NODE_CUSTOMGRAPHICS_POSITION_3',
    'NODE_CUSTOMGRAPHICS_POSITION_4',
    'NODE_CUSTOMGRAPHICS_POSITION_5',
    'NODE_CUSTOMGRAPHICS_POSITION_6',
    'NODE_CUSTOMGRAPHICS_POSITION_7',
    'NODE_CUSTOMGRAPHICS_POSITION_8',
    'NODE_CUSTOMGRAPHICS_POSITION_9',
    'NODE_CUSTOMGRAPHICS_SIZE_1',
    'NODE_CUSTOMGRAPHICS_SIZE_2',
    'NODE_CUSTOMGRAPHICS_SIZE_3',
    'NODE_CUSTOMGRAPHICS_SIZE_4',
    'NODE_CUSTOMGRAPHICS_SIZE_5',
    'NODE_CUSTOMGRAPHICS_SIZE_6',
    'NODE_CUSTOMGRAPHICS_SIZE_7',
    'NODE_CUSTOMGRAPHICS_SIZE_8',
    'NODE_CUSTOMGRAPHICS_SIZE_9',
    'NODE_CUSTOMPAINT_1',
    'NODE_CUSTOMPAINT_2',
    'NODE_CUSTOMPAINT_3',
    'NODE_CUSTOMPAINT_4',
    'NODE_CUSTOMPAINT_5',
    'NODE_CUSTOMPAINT_6',
    'NODE_CUSTOMPAINT_7',
    'NODE_CUSTOMPAINT_8',
    'NODE_CUSTOMPAINT_9',
    'NODE_DEPTH',
    'NODE_FILL_COLOR',
    'NODE_HEIGHT',
    'NODE_LABEL_COLOR',
    'NODE_LABEL_FONT_FACE',
    'NODE_LABEL_FONT_SIZE',
    'NODE_LABEL_POSITION',
    'NODE_LABEL_TRANSPARENCY',
    'NODE_LABEL_WIDTH',
    'NODE_NESTED_NETWORK_IMAGE_VISIBLE',
    'NODE_PAINT',
    'NODE_SELECTED',
    'NODE_SELECTED_PAINT',
    'NODE_SHAPE',
    'NODE_SIZE',
    'NODE_TRANSPARENCY',
    'NODE_VISIBLE',
    'NODE_WIDTH',
    'NODE_X_LOCATION',
    'NODE_Y_LOCATION',
    'NODE_Z_LOCATION'
  ];
  /**
   * List of known edge properties
   */
  static readonly edgeProperties = [
    'EDGE_CURVED',
    'EDGE_LABEL_COLOR',
    'EDGE_LABEL_FONT_FACE',
    'EDGE_LABEL_FONT_SIZE',
    'EDGE_LABEL_TRANSPARENCY',
    'EDGE_LABEL_WIDTH',
    'EDGE_LINE_TYPE',
    'EDGE_PAINT',
    'EDGE_SELECTED',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SHAPE',
    'EDGE_SOURCE_ARROW_SIZE',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_SHAPE',
    'EDGE_TARGET_ARROW_SIZE',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_TRANSPARENCY',
    'EDGE_UNSELECTED_PAINT',
    'EDGE_VISIBLE',
    'EDGE_WIDTH'
  ];

  /**
   * List of known font face properties which need a special form
   */
  static readonly fontFaceProperties = [
    'NODE_LABEL_FONT_FACE',
    'EDGE_LABEL_FONT_FACE'
  ];

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
  selectedPassthroughMapping: NeMapping;
  /**
   * Selected discrete mapping property
   */
  selectedDiscreteMappingProperty: string;
  /**
   * Name of a property which is to be deleted
   */
  selectedForDeletion: string;
  /**
   * On selection of a mapping this typehint is set
   */
  selectedTypeHint: NeMappingsType;
  /**
   * Canvas used to display a network
   */
  canvas: HTMLElement;
  /**
   * The network ID increment
   */
  currentNetworkId = -1;
  /**
   * List of known color properties, mainly used for color previews within {@link MainMappingsNewComponent}
   */
  colorProperties: string[] = [
    'NETWORK_BACKGROUND_PAINT',
    'NODE_BORDER_PAINT',
    'NODE_FILL_COLOR',
    'NODE_LABEL_COLOR',
    'NODE_PAINT',
    'NODE_SELECTED_PAINT',
    'EDGE_LABEL_COLOR',
    'EDGE_PAINT',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_UNSELECTED_PAINT'
  ];
  /**
   * Toggle redraw of a chart
   */
  chartRedrawEmitter = new EventEmitter<boolean>();
  /**
   * Toggle flipping the layout
   */
  flipLayoutEmitter = new EventEmitter<boolean>();
  /**
   * Toggle rebuild of the network's core for rendering
   */
  networkChangedEmitter = new EventEmitter<NeNetwork>();

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
   * Builds the definition string for a discrete mapping
   * @param mapping Discrete mapping to be condensed into a string
   * @private
   */
  private buildDiscreteMappingDefinition(mapping: NeMappingDiscrete): string {

    let definition = 'COL=' + mapping.col + ',T=' + mapping.type || 'string';
    for (let i = 0; i < mapping.keys.length; i++) {

      if (this.colorProperties.includes(mapping.styleProperty)
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
   * Fetches a network by its id
   * @param id The network's id
   */
  getNetworkById(id: number): NeNetwork {
    return this.networksParsed.find(x => x.id === id);
  }

  /**
   * Removes a mapping completely
   */
  removeMapping(mapping: NeMapping, elementType: ElementType, mappingType: MappingType): void {
    for (const fd of this.selectedNetwork.cx) {
      if (fd.cyVisualProperties) {

        for (const cvp of fd.cyVisualProperties) {

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
    }
  }

  /**
   * Returns ID of a discrete mapping, which suits the specified property
   * @param mappings
   * @param property
   */
  findDiscreteMappingForProperty(mappings: NeMappingDiscrete[], property: NeAspect): number {
    // for (const mapping of mappings) {
    //   if (mapping.col === property.name) {
    //     return mappings.indexOf(mapping);
    //   }
    // }
    return null;
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

    for (const entry of this.selectedNetwork.cx) {
      if (entry.cyVisualProperties) {
        for (const item of entry.cyVisualProperties) {

          if (!item.mappings && item.properties_of !== 'network') {
            item.mappings = {};
            continue;
          }
          if ((elementType === ElementType.node && (item.properties_of === 'nodes' || item.properties_of === 'nodes:default'))
            || (elementType === ElementType.edge && (item.properties_of === 'edges' || item.properties_of === 'edges:default'))
          ) {
            item.mappings[mapping.styleProperty] = {
              definition: this.buildDiscreteMappingDefinition(mapping),
              type: 'DISCRETE'
            };
          }
        }
      }
    }
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

    for (const entry of this.selectedNetwork.cx) {
      if (entry.cyVisualProperties) {
        for (const item of entry.cyVisualProperties) {

          if (!item.mappings && item.properties_of !== 'network') {
            item.mappings = {};
            continue;
          }
          if ((elementType === ElementType.node && (item.properties_of === 'nodes' || item.properties_of === 'nodes:default'))
            || (elementType === ElementType.edge && (item.properties_of === 'edges' || item.properties_of === 'edges:default'))
          ) {
            item.mappings[mapping.styleProperty] = {
              definition: DataService.buildContinuousMappingDefinition(mapping),
              type: 'CONTINUOUS'
            };
          }
        }
      }
    }
    this.triggerNetworkCoreBuild(this.selectedNetwork);
  }

  /**
   * WIP
   * @param network
   * @param mapping
   * @param elementType
   */
  addMappingPassthrough(network: NeNetwork, mapping: NeMapping, elementType: ElementType): void {
    return;
  }

  /**
   * Applies a layout to a network and rebuilds the core
   */
  applyLayout(withCoreRebuild: boolean = true): void {

    const newNodes = this.selectedNetwork.core.nodes();
    const cx = this.selectedNetwork.cx;
    for (const item of cx) {
      if (!!item.cartesianLayout) {

        for (const node of item.cartesianLayout) {

          const id = node.node;
          const newNode = newNodes.getElementById(id);

          node.x = newNode.position().x;
          node.y = newNode.position().y;

        }
      }
    }
    if (withCoreRebuild) {
      this.triggerNetworkCoreBuild(this.selectedNetwork);
    }
  }

  /**
   * Removing a property from an existing mapping can only be executed for discrete mappings.
   * It works directly on the cx data and triggers the core rebuild.
   */
  removePropertyFromMapping(): void {
    console.log('marked for deletion: removePropertyFromMapping@dataService:543');
    return;
    // const isNode = this.selectedTypeHint.nd;
    //
    // for (const fd of this.selectedNetwork.cx) {
    //   if (fd.cyVisualProperties) {
    //     for (const cvp of fd.cyVisualProperties) {
    //       if (isNode && cvp.properties_of === 'nodes:default' && cvp.mappings) {
    //         if (cvp.mappings[this.selectedForDeletion]) {
    //           delete cvp.mappings[this.selectedForDeletion];
    //           break;
    //         }
    //
    //       } else if (!isNode && cvp.properties_of === 'edges:default' && cvp.mappings) {
    //         if (cvp.mappings[this.selectedForDeletion]) {
    //           delete cvp.mappings[this.selectedForDeletion];
    //           break;
    //         }
    //       }
    //     }
    //   }
    // }
    // this.selectPropertyForDeletion();
    // this.triggerNetworkCoreBuild();

  }

  /**
   * Edits an existing discrete mapping
   */
  editMappingDiscrete(typeHint: NeMappingsType, mapping: NeMappingDiscrete, discretePropertyPointer: number = null): void {
    console.log('marked for deletion: editMappingDiscrete@dataService:576');
    return;
    // if (typeHint.nd || typeHint.ed) {
    //   this.selectPropertyForDeletion(discretePropertyPointer);
    //   this.removePropertyFromMapping();
    //   this.addMappingDiscrete(mapping, typeHint);
    //   this.selectPropertyForDeletion();
    // }

  }

  /**
   * Edits an existing continuous mapping
   * @param typeHint indicates type of mapping
   * @param thresholds list of newly defined thresholds
   */
  editMappingContinuous(typeHint: NeMappingsType, thresholds: NeThresholdMap[]): void {

    // if (!(typeHint.ec || typeHint.nc) || !this.selectedContinuousMapping) {
    //   console.log('Editing continuous mapping not possible!');
    //   return;
    // }
    //
    // const defLower = thresholds[0];
    // const defGreater = thresholds[1];
    // thresholds = thresholds
    //   .filter(a => a.value !== null)
    //   .sort((a, b) => a.value > b.value ? 1 : -1);
    //
    // const mapThresholds = thresholds.map(a => a.value);
    // const equals = thresholds.map(a => a.propertyValue);
    // const lowers: string[] = thresholds.map(a => a.propertyValue);
    // const greaters: string[] = thresholds.map(a => a.propertyValue);
    // lowers[0] = defLower.propertyValue;
    // greaters[greaters.length - 1] = defGreater.propertyValue;
    //
    // const newMapping: NeMappingContinuous = this.selectedContinuousMapping;
    // newMapping.equals = equals;
    // newMapping.lowers = lowers;
    // newMapping.greaters = greaters;
    // newMapping.thresholds = mapThresholds;
    //
    // this.removeMapping();
    // this.addMappingContinuous(newMapping, newMapping.styleProperty, typeHint);
  }

  /**
   * Emits a value to trigger redrawing of a displayed chart
   * Avoids unpretty distortions of charts
   */
  triggerChartRedraw(): void {
    this.chartRedrawEmitter.emit(true);
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
   * Selecting a passthrough mapping for edit mode
   * @param mapping passsthrough mapping to a specific property
   */
  selectMappingPassthrough(mapping: NeMapping): void {
    this.resetAnyMappingSelection();
    this.selectedPassthroughMapping = mapping;
  }

  /**
   * Selects a discrete or continuous mapping based on a typehint
   * @param mapHint [DISCRETE] hint containing typehint
   * @param col [DISCRETE] property needs to be specified when selecting a discrete mapping
   * @param mapId [CONTINUOUS|PASSTHROUGH] string containing both typehint and id for continuous mappings
   */
  selectMapping(mapHint: string = null, col: string = null, mapId: string = null): void {

    // if (mapId !== null) {
    //   // continuous or passthrough mapping do not need property
    //   this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapId.substr(0, 2));
    //   const pointer = Number(mapId.substr(2));
    //
    //   if (this.selectedTypeHint.nc) {
    //     this.selectedContinuousMapping = this.selectedNetwork.mappings.nodesContinuous[pointer];
    //     this.selectedPassthroughMapping = null;
    //   } else if (this.selectedTypeHint.ec) {
    //     this.selectedContinuousMapping = this.selectedNetwork.mappings.edgesContinuous[pointer];
    //     this.selectedPassthroughMapping = null;
    //   } else if (this.selectedTypeHint.np) {
    //     this.selectedPassthroughMapping = this.selectedNetwork.mappings.nodesPassthrough[pointer];
    //     this.selectedContinuousMapping = null;
    //   } else if (this.selectedTypeHint.ep) {
    //     this.selectedPassthroughMapping = this.selectedNetwork.mappings.edgesPassthrough[pointer];
    //     this.selectedContinuousMapping = null;
    //   }
    //
    //   this.selectedDiscreteMapping = null;
    //   this.selectedDiscreteMappingProperty = null;
    //
    // } else {
    //
    //   this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapHint);
    //   const selectedDiscrete: NeMappingDiscrete[] = [];
    //
    //   if (this.selectedTypeHint.nd) {
    //     for (const nd of this.selectedNetwork.mappings.nodesDiscrete) {
    //       if (nd.col === col && !selectedDiscrete.includes(nd)) {
    //         if (this.selectedDiscreteMappingProperty !== nd.col) {
    //           this.selectedDiscreteMappingProperty = nd.col;
    //         }
    //         selectedDiscrete.push(nd);
    //       }
    //     }
    //   } else if (this.selectedTypeHint.ed) {
    //     for (const ed of this.selectedNetwork.mappings.edgesDiscrete) {
    //       if (ed.col === col && !selectedDiscrete.includes(ed)) {
    //         if (this.selectedDiscreteMappingProperty !== ed.col) {
    //           this.selectedDiscreteMappingProperty = ed.col;
    //         }
    //         selectedDiscrete.push(ed);
    //       }
    //     }
    //   }
    //   this.selectedDiscreteMapping = selectedDiscrete;
    //   this.selectedContinuousMapping = null;
    //   this.selectedPassthroughMapping = null;
    // }
  }

  /**
   * Selects a property within a discrete mapping for deletion.
   * A discrete mapping has to be active for this to work
   * @param propertyId points to the id within the discrete mapping to be deleted
   */
  selectPropertyForDeletion(propertyId: number = null): void {
    console.log('marked for deletion: selectPropertyForDeletion@dataService:738');
    return;
    // if (propertyId === null) {
    //   this.selectedForDeletion = null;
    //   return;
    // }
    //
    // if (!this.selectedDiscreteMapping) {
    //   console.log('No discrete mapping selected to delete property with ID: ' + propertyId);
    //   return;
    // }
    // this.selectedForDeletion = this.selectedDiscreteMapping[propertyId].styleProperty;
  }

  /**
   * Resets a selected discrete mapping property
   */
  resetDiscreteMappingPropertySelection(): void {
    console.log('marked for deletion: resetDiscreteMappingPropertySelection@dataService:751');
    return;
    // this.selectedDiscreteMappingProperty = null;
  }

  /**
   * Resets any mapping selection
   */
  resetAnyMappingSelection(): void {
    this.selectedDiscreteMapping = null;
    this.selectedContinuousMapping = null;
    this.selectedPassthroughMapping = null;
    this.selectedDiscreteMappingProperty = null;
    this.selectedTypeHint = null;
  }

  /**
   * Returns true if any mapping is selected
   */
  isAnyMappingSelected(): boolean {
    return !!(this.selectedContinuousMapping || this.selectedDiscreteMapping || this.selectedPassthroughMapping);
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
   * Returns the mapping belonging to this typehint with id, e.g. 'nd0' returns the discrete node mapping on index 0
   * @param hintWithId string containing both typehint and id
   */
  getMappingByHintAndId(hintWithId: string): NeMappingDiscrete | NeMappingContinuous {
    console.log('marked for deletion: getMappingByHintAndId@dataService:784');
    return null;
    // const hintString = hintWithId.substring(0, 2);
    // const id = hintWithId.substring(2);
    // const typeHint = this.utilityService.utilGetTypeHintByString(hintString);
    // if (typeHint.nd) {
    //   return this.selectedNetwork.mappings.nodesDiscrete[id];
    // } else if (typeHint.nc) {
    //   return this.selectedNetwork.mappings.nodesContinuous[id];
    // } else if (typeHint.ed) {
    //   return this.selectedNetwork.mappings.edgesDiscrete[id];
    // } else if (typeHint.ec) {
    //   return this.selectedNetwork.mappings.edgesContinuous[id];
    // } else if (typeHint.np) {
    //   return this.selectedNetwork.mappings.nodesPassthrough[id];
    // } else if (typeHint.ep) {
    //   return this.selectedNetwork.mappings.edgesPassthrough[id];
    // }
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
   * Returns the number of elements for each type of mapping for the currently selected network
   * @param type string indicating type of mapping, e.g. 'nd'
   */
  countMappingsByHint(type: string): number {
    console.log('marked for deletion: countMappingsByHint@dataService:834');
    return 0;
    // switch (type) {
    //   case 'nd':
    //     return this.selectedNetwork.mappings.nodesDiscrete.length;
    //   case'nc':
    //     return this.selectedNetwork.mappings.nodesContinuous.length;
    //   case 'np':
    //     return this.selectedNetwork.mappings.nodesPassthrough.length;
    //   case 'ed':
    //     return this.selectedNetwork.mappings.edgesDiscrete.length;
    //   case 'ec':
    //     return this.selectedNetwork.mappings.edgesContinuous.length;
    //   case 'ep':
    //     return this.selectedNetwork.mappings.edgesPassthrough.length;
    // }
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

  /**
   * Returns a style property's attribute type. That can either be color, numeric or default (string)
   * @param styleProperty Name of the style property
   */
  getAttributeByStyleProperty(styleProperty: string): AttributeType {
    const isColor = this.colorProperties.includes(styleProperty);
    const isNumeric = DataService.continuousProperties.includes(styleProperty);
    const isFontFace = DataService.fontFaceProperties.includes(styleProperty);

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
   * Returns a continuous mapping from the currently active network,
   * where col and styleProperty match the given parameters.
   * @param col
   * @param prop
   * @param elementType
   */
  findMappingContinuousByColAndProp(col: string, prop: string, elementType: ElementType): NeMappingContinuous {
    console.log('marked for deletion: findMappingContinuousByColAndProp@dataService:917');
    return null;

    // if (elementType === ElementType.node) {
    //   return this.selectedNetwork.mappings.nodesContinuous.find(a => a.col === col && a.styleProperty === prop);
    // }
    // return this.selectedNetwork.mappings.edgesContinuous.find(a => a.col === col && a.styleProperty === prop);
  }

  /**
   * Returns a discrete mapping from the currently active network,
   * where col and styleProperty match the given parameters.
   * @param col The mapping's column
   * @param prop The mapping's style property
   * @param elementType Points to the type of element in {@link UtilityService#elementType}
   */
  findMappingDiscreteByColAndProp(col: string, prop: string, elementType: ElementType): NeMappingDiscrete {
    console.log('marked for deletion: findMappingDiscreteByColAndProp@dataService:934');
    return null;
    // if (elementType === ElementType.node) {
    //   return this.selectedNetwork.mappings.nodesDiscrete.find(a => a.col === col && a.styleProperty === prop);
    // }
    // return this.selectedNetwork.mappings.edgesDiscrete.find(a => a.col === col && a.styleProperty === prop);
  }

  /**
   * Returns a passthrough mapping from the currently active network,
   * where col and styleProperty match the given parameters.
   * @param col The mapping's column
   * @param prop The mapping's style property
   * @param elementType Points to the type of element in {@link UtilityService#elementType}
   */
  findMappingPassthroughByColAndProp(col: string, prop: string, elementType: ElementType): NeMapping {
    console.log('marked for deletion: findMappingPassthroughByColAndProp@dataService:949');
    return null;
    // if (elementType === ElementType.node) {
    //   return this.selectedNetwork.mappings.nodesPassthrough.find(a => a.col === col && a.styleProperty === prop);
    // }
    // return this.selectedNetwork.mappings.edgesPassthrough.find(a => a.col === col && a.styleProperty === prop);
  }

  findAnyMappingByColAndProp(col: string, prop: string, elementType: ElementType, mappingType: MappingType): NeMapping {
    console.log('marked for deletion: findAnyMappingByColAndProp@dataService:951');
    return null;
    //
    // if (elementType === ElementType.node) {
    //   switch (mappingType) {
    //     case MappingType.passthrough:
    //       return this.selectedNetwork.mappings.nodesPassthrough.find(a => a.col === col && a.styleProperty === prop);
    //     case MappingType.discrete:
    //       return this.selectedNetwork.mappings.nodesDiscrete.find(a => a.col === col && a.styleProperty === prop);
    //     case MappingType.continuous:
    //       return this.selectedNetwork.mappings.nodesContinuous.find(a => a.col && a.styleProperty === prop);
    //   }
    // } else {
    //   switch (mappingType) {
    //     case MappingType.passthrough:
    //       return this.selectedNetwork.mappings.edgesPassthrough.find(a => a.col === col && a.styleProperty === prop);
    //     case MappingType.discrete:
    //       return this.selectedNetwork.mappings.edgesDiscrete.find(a => a.col === col && a.styleProperty === prop);
    //     case MappingType.continuous:
    //       return this.selectedNetwork.mappings.edgesContinuous.find(a => a.col === col && a.styleProperty === prop);
    //   }
    // }
    // console.log('No match found for col and prop!');
    // return null;
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
}
