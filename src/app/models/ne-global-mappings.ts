import {NeMappingsDefinition} from './ne-mappings-definition';
import {NeStyleComponent} from './ne-style-component';
import {NeContinuousChart} from './ne-continuous-chart';
import {NeContinuousCollection} from './ne-continuous-collection';

export interface NeGlobalMappings {
  discrete?: NeMappingsDefinition[];
  continuous?: NeContinuousCollection[];
}
