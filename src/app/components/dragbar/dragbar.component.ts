import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LayoutService} from '../../services/layout.service';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faExchangeAlt,
  faRedo
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dragbar',
  templateUrl: './dragbar.component.html',
  styleUrls: ['./dragbar.component.scss']
})
export class DragbarComponent implements OnInit {
  /**
   * Icon: faAngleDoubleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleDoubleLeft = faAngleDoubleLeft;
  /**
   * Icon: faAngleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleLeft = faAngleLeft;
  /**
   * Icon: faAngleRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleRight = faAngleRight;
  /**
   * Icon: faAngleDoubleRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleDoubleRight = faAngleDoubleRight;
  /**
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Icon: faExchangeAlt
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExchangeAlt = faExchangeAlt;

  constructor(
    public layoutService: LayoutService
  ) {
  }

  ngOnInit(): void {
  }

  /**
   * Triggers the language emitter, updating the language throughout the application
   * @param lang name of language
   */
  // setLanguage(lang: string): void {
  //   this.languageEmitter.emit(lang);
  // }

}
