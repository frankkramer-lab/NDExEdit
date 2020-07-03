import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';
import {faInfo, faPaintBrush} from '@fortawesome/free-solid-svg-icons';
import {ParseService} from '../../services/parse.service';
import {GraphService} from '../../services/graph.service';

@Component({
  selector: 'app-sidebar-manage',
  templateUrl: './sidebar-manage.component.html',
  styleUrls: ['./sidebar-manage.component.scss']
})
export class SidebarManageComponent {

  faPaintBrush = faPaintBrush;
  faInfo = faInfo;

  constructor(public dataService: DataService, public graphService: GraphService, public parseService: ParseService) {
  }

}
