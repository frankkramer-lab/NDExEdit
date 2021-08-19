import {Component} from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleRight,
  faAngleLeft,
  faAngleDoubleLeft,
  faComments,
  faExchangeAlt,
  faThumbsUp,
  faRedo,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {LayoutService} from '../../services/layout.service';

@Component({
  selector: 'app-main-info',
  templateUrl: './main-info.component.html',
  styleUrls: ['./main-info.component.scss']
})

/**
 * Component responsible for FAQ display
 */
export class MainInfoComponent {
  /**
   * Icon: faAngleRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleRight = faAngleRight;
  /**
   * Icon: faAngleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleLeft = faAngleLeft;
  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;
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
  /**
   * Icon: faThumbsUp
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faThumbsUp = faThumbsUp;

  /**
   * Icon: faUserGraduate
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUserGraduate = faUserGraduate;

  /**
   * Icon: faComments
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faComments = faComments;

  /**
   *
   * @param dataService Service responsible for data access
   * @param layoutService Service responsible for tooltip directions
   */
  constructor(
    public dataService: DataService,
    public layoutService: LayoutService

    ) {

  }
}
