import {NeSearchResultItem} from './ne-search-result-item';
import {NeSearchResult} from './ne-search-result';

/**
 * Summarized network search results
 */
export interface NeSearchResultUser extends NeSearchResult {
  /**
   * List of networks that match the search term in any way
   */
  resultList: NeSearchResultItem[];
}
