/**
 * Represents a numeric value which is mapped to a specific property value
 */
export interface NeThresholdMap {

  /**
   * Numeric input value
   */
  value: number;

  /**
   * The resulting property value
   */
  propertyValue: string;

  /**
   * True, if this property can be changed by the user
   */
  isEditable: boolean;
}
