import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';
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

  faPaintBrush = faPaintBrush;
  faInfo = faInfo;

  constructor(public dataService: DataService) {
  }

}
