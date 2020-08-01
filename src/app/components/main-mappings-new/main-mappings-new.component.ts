import {Component, OnInit} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowRight, faArrowLeft, faPalette, faUndo, faCheck} from '@fortawesome/free-solid-svg-icons';
import {NeMappingsDefinition} from '../../models/ne-mappings-definition';
import {NeAspect} from '../../models/ne-aspect';

@Component({
  selector: 'app-main-mappings-new',
  templateUrl: './main-mappings-new.component.html',
  styleUrls: ['./main-mappings-new.component.scss']
})

/**
 * Component responsible for creating new mappings
 */
export class MainMappingsNewComponent implements OnInit {
  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
  faPalette = faPalette;
  faUndo = faUndo;
  faCheck = faCheck;

  propertyToMap: NeAspect;
  styleProperty: string;

  selectedNetwork: NeNetwork;
  selectedAspect: any;
  mappingsType = {
    nd: false,
    nc: false,
    ed: false,
    ec: false
  };
  nodesColorProperties: string[] = ['background-color', 'border-color'];
  edgesColorProperties: string[] = ['line-color', 'target-arrow-color', 'source-arrow-color'];

  discreteMapping: NeMappingsDefinition[];

  constructor(private route: ActivatedRoute,
              public dataService: DataService) {

    this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      const propertyPointer = params.get('property');
      switch (params.get('map')) {
        case 'nd':
          this.mappingsType.nd = true;
          this.mappingsType.nc = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes[propertyPointer];
          break;
        case 'nc':
          this.mappingsType.nc = true;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesNodes[propertyPointer];
          break;
        case 'ed':
          this.mappingsType.ed = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ec = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges[propertyPointer];
          break;
        case 'ec':
          this.mappingsType.ec = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          this.propertyToMap = this.selectedNetwork.aspectKeyValuesEdges[propertyPointer];
          break;

      }
      this.discreteMapping = [];
    });

  }

  ngOnInit(): void {
  }
}
