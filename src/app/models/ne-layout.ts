import {NeLayoutElement} from './ne-layout-element';

/**
 * Collection of layout components, contains both main and sidebar
 */
export interface NeLayout {
  /**
   * Main view
   */
  main: NeLayoutElement;
  /**
   * Sidebar view
   */
  sidebar: NeLayoutElement;

}
