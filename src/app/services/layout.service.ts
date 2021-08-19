import {EventEmitter, Injectable} from '@angular/core';
import {NeLayout} from '../models/ne-layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  /**
   * Emits the current layout to the dataservice to trigger a chart redraw.
   */
  layoutEmitter = new EventEmitter<any>();
  /**
   * Minimum width equals collapsed column
   */
  minWidth = 2;
  /**
   * Maximum width equals maximised column
   */
  maxWidth = 10;

  /**
   * Layout object
   */
  layout: NeLayout = {
    main: {
      position: 'right',
      width: 6,
      tooltipDirection: 'left'
    },
    sidebar: {
      position: 'left',
      width: 6,
      tooltipDirection: 'right'
    }
  };

  constructor() {
  }

  /**
   * Increases left side of the app,
   * decreases right side of the app
   */
  increaseLayoutLeft(): void {
    if (this.layout.main.position === 'left') {
      if (this.layout.sidebar.width > this.minWidth) {
        this.layout.sidebar.width--;
        this.layout.main.width++;
      }
    } else if (this.layout.sidebar.position === 'left') {
      if (this.layout.main.width > this.minWidth) {
        this.layout.sidebar.width++;
        this.layout.main.width--;
      }
    }
    this.emitLayout();
  }

  /**
   * Increases right side of the app,
   * decreases left side of the app
   */
  increaseLayoutRight(): void {
    if (this.layout.main.position === 'right') {
      if (this.layout.sidebar.width > this.minWidth) {
        this.layout.sidebar.width--;
        this.layout.main.width++;
      } else if (this.layout.sidebar.width === this.minWidth) {
        this.maxOut('right');
      }
    } else if (this.layout.sidebar.position === 'right') {
      if (this.layout.main.width > this.minWidth) {
        this.layout.sidebar.width++;
        this.layout.main.width--;
      } else if (this.layout.main.width === this.minWidth) {
        this.maxOut('right');
      }
    }
    this.emitLayout();
  }

  /**
   * Increases the given direction to the maximum, thus collapsing the opposite completely
   * @param direction either 'left' or 'right'
   */
  maxOut(direction: string): void {

    // todo needs to contain collapse functionality

    if (this.layout.main.position === direction) {
      this.layout.sidebar.width = this.minWidth;
      this.layout.main.width = this.maxWidth;
    } else if (this.layout.sidebar.position === direction) {
      this.layout.sidebar.width = this.maxWidth;
      this.layout.main.width = this.minWidth;
    }
    this.emitLayout();
  }

  /**
   * Resets the widths to the element's default.
   * Main has a default of 65,
   * sidebar has a default of 30.
   */
  resetLayout(): void {
    this.layout.main.width = 6;
    this.layout.sidebar.width = 6;
    this.emitLayout();
  }

  /**
   * Flips the layout, while the bar for flipping keeps its position.
   * That means the initial width of main is then the width of the sidebar
   * and vice versa.
   */
  flipLayout(): void {
    if (this.layout.main.position === 'left') {
      this.layout.main.position = 'right';
      this.layout.main.tooltipDirection = 'left';
      this.layout.sidebar.position = 'left';
      this.layout.sidebar.tooltipDirection = 'right';
    } else {
      this.layout.main.position = 'left';
      this.layout.main.tooltipDirection = 'right';
      this.layout.sidebar.position = 'right';
      this.layout.sidebar.tooltipDirection = 'left';
    }
    const mainWidth = this.layout.main.width;
    this.layout.main.width = this.layout.sidebar.width;
    this.layout.sidebar.width = mainWidth;
    this.emitLayout();
  }

  /**
   * Emits the layout after change
   */
  emitLayout(): void {
    this.layoutEmitter.emit(this.layout);
  }

}
