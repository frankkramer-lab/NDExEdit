/**
 * Information about a network
 */
import {NeKeyValue} from './ne-key-value';

export interface NeNetworkInformation {

  /**
   * Name of the network
   */
  name?: string;

  /**
   * UUID
   */
  uuid?: string;

  /**
   * List of information items
   */
  information: NeKeyValue[];

  /**
   * List of ndexStatus items
   */
  status: NeKeyValue[];
}
