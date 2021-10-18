import {ElementType, MappingType} from '../services/utility.service';
import {NeAspect} from './ne-aspect';

export interface NeMappingEmission {
  /**
   * Mapping type of newly added mapping
   */
  mappingType: MappingType;
  /**
   * Element type of newly added mapping
   */
  elementType: ElementType;
  /**
   * Aspect relating to the newly added mapping
   */
  aspect: NeAspect;
}
