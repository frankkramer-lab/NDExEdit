import {ElementType, MappingType} from '../services/utility.service';

export interface NeEditItem {
  /**
   * Node or edge or null (for network)
   */
  elementType: ElementType;

  /**
   * Should only ever be discrete or continuous
   */
  mappingType: MappingType;

  /**
   * True, if network attributes, such as rightsholder, are being edited
   */
  nwInfo: boolean;

  /**
   * True, if network default visuals, such as background color, are being edited
   */
  nwVisuals: boolean;
}
