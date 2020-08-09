import {Component} from '@angular/core';
import {faFileDownload, faFileExport, faInfo, faPaintBrush, faSave} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {HttpClient} from '@angular/common/http';
import {NeMappings} from '../../models/ne-mappings';
import {NeGroupedMappingsDiscrete} from '../../models/ne-grouped-mappings-discrete';
import {NeConversionMap} from '../../models/ne-conversion-map';

@Component({
  selector: 'app-sidebar-manage',
  templateUrl: './sidebar-manage.component.html',
  styleUrls: ['./sidebar-manage.component.scss']
})

/**
 * Component responsible for graph selection and file management
 */
export class SidebarManageComponent {

  /**
   * Icon: faPaintBrush
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPaintBrush = faPaintBrush;

  /**
   * Icon: faInfo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faInfo = faInfo;

  /**
   * Icon: faFileDownload
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileDownload = faFileDownload;

  /**
   * Icon: faSave
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSave = faSave;

  /**
   * Icon: faFileExport
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileExport = faFileExport;

  /**
   * Lookup data needed for reconversion purposes
   */
  lookupData: NeConversionMap[];

  /**
   * Name of lookup file
   *
   * @private
   */
  private readonly lookupFileName = 'lookup.json';

  /**
   * Path to lookup data
   *
   * @private
   */
  private readonly lookupFilePath = 'assets/';


  constructor(public dataService: DataService, private http: HttpClient) {
    this.http.get(this.lookupFilePath.concat(this.lookupFileName))
      .toPromise()
      .then((fileContent: any) => {
        this.lookupData = fileContent;
      })
      .catch(error => console.error(error));
  }

  /**
   * Triggers reconversion to .cx file format and downloads the resulting file
   *
   * @param id network's id
   */
  downloadAsCx(id: number): void {
    const data: Response = this.reconvert(id);
  }

  /**
   * Converts a network to .cx file format
   *
   * @param id network's id
   */
  reconvert(id: number): Response {
    const network = this.dataService.networksParsed.find(x => x.id === id);
    let mappingsNodes: NeMappings[] = [];
    let mappingsEdges: NeMappings[] = [];
    let cyVisualProperties;

    for (const ndMapping of network.mappings.nodesDiscrete) {
      const map: NeMappings[] = this.buildDiscreteMappingDefinition(ndMapping);
      mappingsNodes = mappingsNodes.concat(map);
    }

    for (const edMapping of network.mappings.edgesDiscrete) {
      const map: NeMappings[] = this.buildDiscreteMappingDefinition(edMapping);
      mappingsEdges = mappingsEdges.concat(map);
    }


    for (const ncMapping of network.mappings.nodesContinuous) {
      const map: NeMappings[] = this.buildContinuousMappingDefinition(ncMapping);
      mappingsNodes = mappingsNodes.concat(map);
    }

    for (const ecMapping of network.mappings.edgesContinuous) {
      const map: NeMappings[] = this.buildContinuousMappingDefinition(ecMapping);
      mappingsEdges = mappingsEdges.concat(map);
    }
    console.log(mappingsNodes, mappingsEdges);

    const originalFile = this.http.get(network.networkInformation.originalFilename)
      .toPromise()
      .then((originalData: any[]) => {

        for (const aspect of originalData) {
          if (aspect.cyVisualProperties) {
            cyVisualProperties = aspect.cyVisualProperties;
            break;
          }
        }

        for (const cvp of cyVisualProperties) {
          switch (cvp.properties_of) {
            case 'nodes:default':
              break;
            case 'edges:default':
              break;

          }
        }

      })
      .catch(error => console.error(error));


    return null;

  }

  private buildDiscreteMappingDefinition(dMapping: NeGroupedMappingsDiscrete): NeMappings[] {

    // todo FIX NODE_LABEL_POSITION!!!!!! => probably have to use deepLookup instead of only checking for corresponding keys
    const newMappings: NeMappings[] = [];
    const col = dMapping.classifier;

    for (const style of dMapping.styleMap) {
      for (const lookup of this.lookupKey([style.cssKey], 'cytoscape', 'ndex')) {
        const kCollection = [];
        const vCollection = [];
        const t = dMapping.datatype;

        for (const value of dMapping.values) {
          kCollection.push(value);
          vCollection.push(style.cssValues[dMapping.values.indexOf(value)]);
        }

        const newMap: NeMappings = {
          key: lookup,
          type: 'DISCRETE',
          definition: this.collapseDiscreteMappingIntoString(col, t, kCollection, vCollection)
        };

        newMappings.push(newMap);
      }
    }
    return newMappings;
  }

  private buildContinuousMappingDefinition(cMapping: any): NeMappings[] {
    const newMappings: NeMappings[] = [];
    const col = cMapping.title[1];

    for (const lookup of this.lookupKey(cMapping.title[0], 'cytoscape', 'ndex')) {
      if (cMapping.chartValid) {
        const lCollection: string[] = [];
        const eCollection: string[] = [];
        const gCollection: string[] = [];
        const ovCollection: string[] = [];
        for (let i = 0; i < cMapping.chart.lineChartLabels.length; i++) {
          ovCollection.push(cMapping.chart.lineChartLabels[i]);
          lCollection.push(cMapping.chart.lineChartData[0].data[i]);
          eCollection.push(cMapping.chart.lineChartData[0].data[i]);
          gCollection.push(cMapping.chart.lineChartData[0].data[i]);
        }
        // ovCollection.splice(0, 1); // remove threshold for default lowest
        // ovCollection.splice(ovCollection.length - 1, 1); // remove threshold for default highest

        const defaultLower = cMapping.chart.lineChartData[0].data[0];
        const defaultGreater = cMapping.chart.lineChartData[0].data[cMapping.chart.lineChartData[0].data.length - 1];

        const newNumericMapping: NeMappings = {
          key: lookup,
          type: 'double',
          definition: this.collapseContinuousMappingIntoString(col, 'double', lCollection, eCollection, gCollection, ovCollection, defaultLower, defaultGreater)
        };
        newMappings.push(newNumericMapping);

      } else if (cMapping.gradientValid) {
        const lCollection: string[] = [];
        const eCollection: string[] = [];
        const gCollection: string[] = [];
        const ovCollection: string[] = [];
        for (const gradient of cMapping.colorGradient) {
          ovCollection.push(gradient.numericThreshold);
          lCollection.push(gradient.color);
          eCollection.push(gradient.color);
          gCollection.push(gradient.color);
        }
        // ovCollection.splice(0, 1, ovCollection[1]); // remove threshold for default lowest
        // ovCollection.splice(ovCollection.length - 1, 1); // remove threshold for default highest

        const defaultLower = cMapping.colorGradient.find(x => x.offset === '-1').color;
        const defaultGreater = cMapping.colorGradient.find(x => x.offset === '101').color;
        const newColorMapping: NeMappings = {
          key: lookup,
          type: 'double',
          definition: this.collapseContinuousMappingIntoString(col, 'double', lCollection, eCollection, gCollection, ovCollection, defaultLower, defaultGreater),
        };
        newMappings.push(newColorMapping);
      }
    }

    return newMappings;
  }


  private lookupKey(keys: string[], from: string = 'ndex', to: string = 'cytoscape'): string[] {

    let mappedKeys: string[] = [];

    for (const key of keys) {
      for (const entry of this.lookupData) {
        if (entry[from].includes(key)) {
          mappedKeys = mappedKeys.concat(entry[to]);
        }
      }
    }
    return mappedKeys;
  }

  private collapseDiscreteMappingIntoString(col: string, t: string, kCollection: string[], vCollection: string[]): string {
    if (kCollection.length !== vCollection.length || kCollection.length === 0) {
      return '';
    }

    const partials = [];
    for (let i = 0; i < kCollection.length; i++) {
      partials.push('K=' + i + '=' + kCollection[i]);
      partials.push('V=' + i + '=' + vCollection[i]);
    }

    return 'COL=' + col + ',T=' + t + ',' + partials.join(',');
  }

  private collapseContinuousMappingIntoString(col: string,
                                              t: string,
                                              lCollection: string[],
                                              eCollection: string[],
                                              gCollection: string[],
                                              ovCollection: string[],
                                              defaultLower: string,
                                              defaultGreater: string): string {

    if (lCollection.length !== eCollection.length || gCollection.length !== lCollection.length) {
      return '';
    }

    const partials = [];
    // for (let i = 0; i < ovCollection.length; i++) {
    //   if (i > 0) {
    //     partials.push('L=' + i + '=' + lCollection[i + 1]);
    //   }
    //   partials.push('E=' + i + '=' + eCollection[i + 1]);
    //   if (i < ovCollection.length - 1) {
    //     partials.push('G=' + i + '=' + gCollection[i + 1]);
    //   }
    //   partials.push('OV=' + i + '=' + ovCollection[i]);
    // }

    console.log(ovCollection);

    for (let i = 1; i < ovCollection.length - 1; i++) {
      if (i === 1) {
        partials.push('L=' + (i - 1) + '=' + defaultLower);
      } else {
        partials.push('L=' + (i - 1) + '=' + lCollection[i]);
      }
      partials.push('E=' + (i - 1) + '=' + eCollection[i]);
      if (i === ovCollection.length - 2) {
        partials.push('G=' + (i - 1) + '=' + defaultGreater);
      } else {
        partials.push('G=' + (i - 1) + '=' + gCollection[i]);
      }
      partials.push('OV=' + (i - 1) + '=' + ovCollection[i]);
    }

    return 'COL=' + col + ',T=' + t + ',' + partials.join(',');
  }
}
