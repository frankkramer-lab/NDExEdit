/**
 * Base element for the layout
 */
export interface NeLayoutElement {
  /**
   * Can either be 'left' or 'right'
   */
  position: string;

  /**
   * Current with of this component, units correspond to bootstrap grid sizes
   * ranging up to 12.
   * When width is 0 this component is completely collapsed.
   */
  width: number;
  /**
   * Direction of the tooltips within this component
   */
  tooltipDirection: string;
}
