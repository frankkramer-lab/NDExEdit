import {Component, OnInit} from '@angular/core';
import {faComments, faThumbsUp, faTools, faUserGraduate} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar-compare',
  templateUrl: './sidebar-compare.component.html',
  styleUrls: ['./sidebar-compare.component.scss']
})

/**
 * Component responsible for graph comparison
 */
export class SidebarCompareComponent implements OnInit {

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
   * Icon: faTools
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTools = faTools;

  constructor() {
  }

  ngOnInit(): void {
  }

}
