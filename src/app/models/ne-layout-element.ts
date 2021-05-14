/**
 * Base element for the layout
 */
export interface NeLayoutElement {
  /**
   * Can either be 'left' or 'right'
   */
  position: string;

  /**
   * Current with of this component, units are vw
   */
  width: number;
  /**
   * Direction of the tooltips within this component
   */
  tooltipDirection: string;
}
