import {Component, Input, OnInit} from '@angular/core';
import {faPlus, faSearch} from '@fortawesome/free-solid-svg-icons';
import {NeAspect} from "../../../models/ne-aspect";
import {NeContinuousCollection} from "../../../models/ne-continuous-collection";
import {NeGroupedMappingsDiscrete} from "../../../models/ne-grouped-mappings-discrete";
import {DataService} from "../../../services/data.service";
import {NeMappingsType} from "../../../models/ne-mappings-type";
import {UtilityService} from "../../../services/utility.service";

@Component({
  selector: 'app-main-mappings-available-attributes',
  templateUrl: './main-mappings-available-attributes.component.html',
  styleUrls: ['./main-mappings-available-attributes.component.scss']
})
export class MainMappingsAvailableAttributesComponent implements OnInit {

  /**
   * Icon: faSearch
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSearch = faSearch;

  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;

  @Input() headline: string;

  @Input() attributeListFull: NeAspect[];

  @Input() mappings: NeContinuousCollection[] | NeGroupedMappingsDiscrete[];

  @Input() type: string;

  typeHint: NeMappingsType;

  constructor(
    public dataService: DataService,
    public utilityService: UtilityService
  ) {
  }

  ngOnInit(): void {
    this.typeHint = this.utilityService.getTypeHintByString(this.type);
  }

}
