import {Component} from '@angular/core';
import {faInfo, faPaintBrush} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar-manage',
  templateUrl: './sidebar-manage.component.html',
  styleUrls: ['./sidebar-manage.component.scss']
})

/**
 * Component responsible for graph selection and file management
 */
export class SidebarManageComponent {

  /**
   * Icon: faPaintBrush
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPaintBrush = faPaintBrush;

  /**
   * Icon: faInfo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faInfo = faInfo;

  constructor() {
  }

}
