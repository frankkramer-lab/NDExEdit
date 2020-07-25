import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {NeNetwork} from '../../models/ne-network';
import {faEdit, faPlus, faTrash, faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-mappings',
  templateUrl: './main-mappings.component.html',
  styleUrls: ['./main-mappings.component.scss']
})
export class MainMappingsComponent implements OnInit {
  faPlus = faPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faTimes = faTimes;
  faCheck = faCheck;

  showList = true;

  selectedNetwork: NeNetwork;
  selectedMapping: any;
  currentMappingId: string;

  constructor(
    private route: ActivatedRoute,
    public dataService: DataService) {

    this.route.paramMap.subscribe(params => {

      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      this.currentMappingId = params.get('map');

      const mapIndex = params.get('map').substring(2);
      switch (params.get('map').substring(0, 2)) {
        case 'ec':
          this.selectedMapping = this.selectedNetwork.mappings.edgesContinuous[mapIndex];
          break;
        case 'nc':
          this.selectedMapping = this.selectedNetwork.mappings.nodesContinuous[mapIndex];
          break;
        case 'ed':
          this.selectedMapping = this.selectedNetwork.mappings.edgesDiscrete[mapIndex];
          break;
        case 'nd':
          this.selectedMapping = this.selectedNetwork.mappings.nodesDiscrete[mapIndex];
          break;
        default:
          break;
      }
    });
  }

  ngOnInit(): void {
  }

  removeDialogue(showList): void {
    this.showList = !showList;
  }

  removeAffirmation(networkId: number, mappingId: string): void {
    this.dataService.removeMapping(networkId, mappingId);
    this.showList = true;
    this.selectedMapping = {};

  }

}
