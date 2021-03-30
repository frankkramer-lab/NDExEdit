/**
 * true for one of the containing four possibilities indicating which type of mapping is handled
 */
export interface NeMappingsType {
  /**
   * Discrete node mapping
   */
  nd: boolean;

  /**
   * Continuous node mapping
   */
  nc: boolean;

  /**
   * Passthrough node mapping
   */
  np: boolean;

  /**
   * Discrete edge mapping
   */
  ed: boolean;

  /**
   * Continuous edge mapping
   */
  ec: boolean;

  /**
   * Passthrough edge mapping
   */
  ep: boolean;
}
