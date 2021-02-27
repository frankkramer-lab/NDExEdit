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
   * Layout object
   */
  layout: NeLayout = {
    main: {
      position: 'right',
      width: 65
    },
    sidebar: {
      position: 'left',
      width: 30
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
      if (this.layout.sidebar.width > 15) {
        this.layout.sidebar.width -= 5;
        this.layout.main.width += 5;
      }
    } else if (this.layout.sidebar.position === 'left') {
      if (this.layout.main.width > 15) {
        this.layout.sidebar.width += 5;
        this.layout.main.width -= 5;
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
      if (this.layout.sidebar.width > 15) {
        this.layout.sidebar.width -= 5;
        this.layout.main.width += 5;
      }
    } else if (this.layout.sidebar.position === 'right') {
      if (this.layout.main.width > 15) {
        this.layout.sidebar.width += 5;
        this.layout.main.width -= 5;
      }
    }
    this.emitLayout();
  }

  /**
   * Resets the widths to the element's default.
   * Main has a default of 65,
   * sidebar has a default of 30.
   */
  resetLayout(): void {
    this.layout.main.width = 65;
    this.layout.sidebar.width = 30;
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
      this.layout.sidebar.position = 'left';
    } else {
      this.layout.main.position = 'left';
      this.layout.sidebar.position = 'right';
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
