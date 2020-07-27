import {Component, OnInit} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faArrowRight, faPalette, faUndo, faCheck} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-mappings-new',
  templateUrl: './main-mappings-new.component.html',
  styleUrls: ['./main-mappings-new.component.scss']
})
export class MainMappingsNewComponent implements OnInit {
  faArrowRight = faArrowRight;
  faPalette = faPalette;
  faUndo = faUndo;
  faCheck = faCheck;

  mappedProperty: string;

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

  constructor(private route: ActivatedRoute,
              public dataService: DataService) {

    this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      switch (params.get('map')) {
        case 'nd':
          this.mappingsType.nd = true;
          this.mappingsType.nc = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          break;
        case 'nc':
          this.mappingsType.nc = true;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          this.mappingsType.ec = false;
          break;
        case 'ed':
          this.mappingsType.ed = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ec = false;
          break;
        case 'ec':
          this.mappingsType.ec = true;
          this.mappingsType.nc = false;
          this.mappingsType.nd = false;
          this.mappingsType.ed = false;
          break;

      }
    });

  }

  ngOnInit(): void {
  }
}
