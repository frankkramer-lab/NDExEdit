import {NeSearchResultItem} from './ne-search-result-item';
import {NeSearchResult} from './ne-search-result';

/**
 * Summarized search results when browsing NDEx via search term
 */
export interface NeSearchResultNetwork extends NeSearchResult {
  /**
   * List of networks that match the search term in any way
   */
  networks: NeSearchResultItem[];
}
