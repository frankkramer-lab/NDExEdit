import {Component} from '@angular/core';
import {faComments, faThumbsUp, faUserGraduate} from '@fortawesome/free-solid-svg-icons';
import {DataService} from "../../services/data.service";

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

  constructor(public dataService: DataService) {

  }

}
