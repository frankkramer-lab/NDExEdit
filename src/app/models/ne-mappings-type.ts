/**
 * true for one of the containing four possibilities indicating which type of mapping is handled
 */
export interface NeMappingsType {
  /**
   * Discrete nodes mapping
   */
  nd: boolean;

  /**
   * Continuous nodes mapping
   */
  nc: boolean;

  /**
   * Discrete edge mapping
   */
  ed: boolean;

  /**
   * Continuous edge mapping
   */
  ec: boolean;
}
