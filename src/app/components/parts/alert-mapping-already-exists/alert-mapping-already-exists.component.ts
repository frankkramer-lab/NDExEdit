import {Component, Input, OnInit} from '@angular/core';
import {faRoute} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../../services/data.service';
import {NeGroupedMappingsDiscrete} from "../../../models/ne-grouped-mappings-discrete";
import {NeAspect} from "../../../models/ne-aspect";

@Component({
  selector: 'app-alert-mapping-already-exists',
  templateUrl: './alert-mapping-already-exists.component.html',
  styleUrls: ['./alert-mapping-already-exists.component.scss']
})
export class AlertMappingAlreadyExistsComponent implements OnInit {

  faRoute = faRoute;

  constructor(public dataService: DataService) {
  }

  @Input() isDiscrete: boolean;

  @Input() isNode: boolean;

  @Input() propertyToMap: NeAspect;

  @Input() styleProperty: string;

  ngOnInit(): void {
  }

}
