/**
 * Network previews that can be displayed as search results
 */
export interface NeSearchResultItem {
  /**
   * UUID of this network or user
   */
  externalId: string;

  /**
   * Name of the network
   */
  name?: string;
  /**
   * Description of the network, may contain HTML tags
   */
  description?: string;
  /**
   * Number of nodes in this network
   */
  nodeCount?: number;
  /**
   * Number of edges in this network
   */
  edgeCount?: number;
  /**
   * Account name of the owner
   */
  owner?: string;
  /**
   * This network's owner's UUID
   */
  ownerUuid?: string;
  /**
   * True, if the network should not be updated,
   * regardless of any user's permission for this network.
   */
  isReadOnly?: boolean;

  /**
   * True, if the network's elements do not exceed the element count limit.
   */
  downloadable?: boolean;
  /**
   * True, if the user can edit this network, either by direct permission
   * or by group permission. Cannot be true, if {@link isReadonly} is true.
   */
  writable?: boolean;
  /**
   * True, if the permission has been requested.
   * False by default.
   */
  checkedPermission?: boolean;
}
