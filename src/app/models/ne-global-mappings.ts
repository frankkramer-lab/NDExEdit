import {NeMappingsDefinition} from './ne-mappings-definition';
import {NeStyleComponent} from './ne-style-component';

export interface NeGlobalMappings {
  discrete?: NeMappingsDefinition[];
  continuous?: NeStyleComponent[];
}
