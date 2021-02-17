import {Component, Input, OnInit} from '@angular/core';
import {faPlus, faSearch} from '@fortawesome/free-solid-svg-icons';
import {NeAspect} from '../../../models/ne-aspect';
import {NeContinuousCollection} from '../../../models/ne-continuous-collection';
import {NeGroupedMappingsDiscrete} from '../../../models/ne-grouped-mappings-discrete';
import {DataService} from '../../../services/data.service';
import {NeMappingsType} from '../../../models/ne-mappings-type';
import {UtilityService} from '../../../services/utility.service';
import {NeMappingDiscrete} from "../../../models/ne-mapping-discrete";
import {NeMappingPassthrough} from "../../../models/ne-mapping-passthrough";

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

  @Input() mappings: NeContinuousCollection[] | NeMappingDiscrete[] | NeMappingPassthrough[];

  @Input() type: string;

  typeHint: NeMappingsType;

  constructor(
    public dataService: DataService,
    public utilityService: UtilityService
  ) {
  }

  ngOnInit(): void {
    this.typeHint = this.utilityService.utilGetTypeHintByString(this.type);
  }

}
