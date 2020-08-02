/**
 * Type for an element's attributes
 */
export interface NeElementAttribute {

  /**
   * Id of the corresponding element
   */
  reference?: string;

  /**
   * cleaned name of the attribute
   */
  key?: string;

  /**
   * human readable name of the attribute
   */
  keyHR?: string;

  /**
   * cleaned value of the attribute
   */
  value?: string;

  /**
   * humand readable value of the attribute
   */
  valueHR?: string;

  /**
   * datatype of the attribute's value, as specified by {@link https://home.ndexbio.org/data-model/|CX data model}
   */
  datatype?: string;
}
