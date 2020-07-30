import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {NeNetwork} from '../../models/ne-network';
import {faEdit, faPlus, faTrash, faTimes, faCheck, faSearch, faArrowLeft} from '@fortawesome/free-solid-svg-icons';

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
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;

  showList = true;

  selectedNetwork: NeNetwork;
  selectedMapping: any[];
  currentMappingId: string[];

  mappingToRemove = {
    map: null,
    type: '',
    network: -1,
    mappingId: -1,
    akvIndex: -1,
  };

  givenMapType: string;

  constructor(
    private route: ActivatedRoute,
    public dataService: DataService) {

    this.route.paramMap.subscribe(params => {

      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      this.givenMapType = params.get('map').substring(0, 2);
      this.currentMappingId = params.get('map').substring(2).split('-');
      this.selectedMapping = [];

      switch (this.givenMapType) {
        case 'ec':
          for (const mapIndex of this.currentMappingId) {
            this.selectedMapping.push(this.selectedNetwork.mappings.edgesContinuous[mapIndex]);
          }
          break;
        case 'nc':
          for (const mapIndex of this.currentMappingId) {
            this.selectedMapping.push(this.selectedNetwork.mappings.nodesContinuous[mapIndex]);
          }
          break;
        case 'ed':
          for (const mapIndex of this.currentMappingId) {
            this.selectedMapping.push(this.selectedNetwork.mappings.edgesDiscrete[mapIndex]);
          }
          break;
        case 'nd':
          for (const mapIndex of this.currentMappingId) {
            this.selectedMapping.push(this.selectedNetwork.mappings.nodesDiscrete[mapIndex]);
          }
          break;
        default:
          break;
      }
    });
  }

  ngOnInit(): void {
  }

  toggleRemoveDialogue(map: any = null, type: string = ''): void {
    switch (type) {
      case 'nd':
        for (const akv of this.selectedNetwork.aspectKeyValuesNodes) {
          if (akv.name === map.classifier) {
            this.mappingToRemove.akvIndex = this.selectedNetwork.aspectKeyValuesNodes.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.selectedNetwork.mappings.nodesDiscrete.indexOf(map);
        break;
      case 'nc':
        for (const akv of this.selectedNetwork.aspectKeyValuesNodes) {
          if (akv.name === map.title[1]) {
            this.mappingToRemove.akvIndex = this.selectedNetwork.aspectKeyValuesNodes.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.selectedNetwork.mappings.nodesContinuous.indexOf(map);
        break;
      case 'ed':
        for (const akv of this.selectedNetwork.aspectKeyValuesEdges) {
          if (akv.name === map.classifier) {
            this.mappingToRemove.akvIndex = this.selectedNetwork.aspectKeyValuesEdges.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.selectedNetwork.mappings.edgesDiscrete.indexOf(map);
        break;
      case 'ec':
        for (const akv of this.selectedNetwork.aspectKeyValuesEdges) {
          if (akv.name === map.title[1]) {
            this.mappingToRemove.akvIndex = this.selectedNetwork.aspectKeyValuesEdges.indexOf(akv);
            break;
          }
        }
        this.mappingToRemove.mappingId = this.selectedNetwork.mappings.edgesContinuous.indexOf(map);
        break;
    }
    this.showList = !this.showList;
    this.mappingToRemove.map = map;
    this.mappingToRemove.type = type;
    this.mappingToRemove.network = this.selectedNetwork.id;
    console.log(this.mappingToRemove);

  }

  confirmDeletion(confirmation: boolean): void {
    if (confirmation) {
      console.log(this.mappingToRemove);
      this.dataService.removeMapping(this.mappingToRemove);
      this.selectedMapping = [];
    }
    this.toggleRemoveDialogue();
  }
}
