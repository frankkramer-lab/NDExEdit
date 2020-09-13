/**
 * Information about a network
 */
export interface NeNetworkInformation {

  /**
   * Name of the network
   */
  name?: string;

  /**
   * Rightsholder for this network
   */
  rightsholder?: string;

  /**
   * Type of network
   */
  networkType?: string;

  /**
   * This network's organism
   */
  organism?: string;

  /**
   * Description of this network, possibly containing HTML markup
   */
  description?: string;

  /**
   * Original filename
   */
  originalFilename?: string;
}
