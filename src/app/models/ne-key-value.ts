/**
 * Item containing key value pairs relating to {@link NeNetworkInformation}
 */
export interface NeKeyValue {
  /**
   * Name of this network information item,
   * e.g. "rightsholder"
   */
  name: string;

  /**
   * Value of the corresponding network information item,
   * e.g. "John Doe"
   */
  value: string;

  /**
   * Optionally a datatype is given to encode non-string information,
   * e.g. "double"
   */
  datatype?: string;
}
