import {NeThresholdMap} from './ne-threshold-map';
import {NeAspect} from './ne-aspect';

export interface NeContinuousThresholds {
  cssKey?: string;
  mappedProperty?: NeAspect;
  defaultLower?: string;
  defaultGreater?: string;
  breakpoints?: NeThresholdMap[];
}
