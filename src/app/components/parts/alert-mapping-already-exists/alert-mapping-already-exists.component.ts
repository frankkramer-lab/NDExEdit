import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {faRoute} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../../services/data.service';
import {NeAspect} from '../../../models/ne-aspect';
import {NeMappingsType} from "../../../models/ne-mappings-type";

@Component({
  selector: 'app-alert-mapping-already-exists',
  templateUrl: './alert-mapping-already-exists.component.html',
  styleUrls: ['./alert-mapping-already-exists.component.scss']
})
export class AlertMappingAlreadyExistsComponent implements OnInit {

  faRoute = faRoute;

  constructor(public dataService: DataService) {
  }

  @Input() typeHint: NeMappingsType;

  @Input() propertyToMap: NeAspect;

  @Input() styleProperty: string;

  ngOnInit(): void {
  }


}
