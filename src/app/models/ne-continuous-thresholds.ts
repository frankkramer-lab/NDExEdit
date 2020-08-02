import {NeThresholdMap} from './ne-threshold-map';

export interface NeContinuousThresholds {
  cssKey?: string;
  defaultLower?: string;
  defaultGreater?: string;
  breakpoints?: NeThresholdMap[];
}
