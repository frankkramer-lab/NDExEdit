export interface NeCyGraphSettings {
  layout?: any;
  zoom?: number;
  pan?: any;
  minZoom?: number;
  maxZoom?: number;
  zoomingEnabled?: boolean;
  userZoomingEnabled?: boolean;
  panningEnabled?: boolean;
  userPanningEnabled?: boolean;
  boxSelectionEnabled?: boolean;
  selectionType?: string;
  touchTapThreshold?: number;
  desktopTapThreshold?: number;
  autolock?: boolean;
  autoungrabify?: boolean;
  autounselectify?: boolean;
  headless?: boolean;
  styleEnabled?: boolean;
  hideEdgesOnViewport?: boolean;
  textureOnViewport?: boolean;
  motionBlur?: boolean;
  motionBlurOpacity?: number;
  wheelSensitivity?: number;
  pixelRatio?: string;
}
