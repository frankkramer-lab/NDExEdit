/**
 * Represents a property within a discrete mapping
 */
import {NeMappingsType} from "./ne-mappings-type";
import {NeStyleMap} from "./ne-style-map";

export interface NeMappingProperty {
  /**
   * Pointer to the discrete node or edge mapping within the list of discrete node or edge mappings
   */
  mapReference: number;

  /**
   * Name of the attribute which specifies the property
   */
  attributeName: string;

  /**
   * Type of mapping
   */
  mapType: NeMappingsType;

  /**
   * Style object belonging to the line of mapping
   */
  style?: NeStyleMap;
}
