import {Component} from '@angular/core';
import {faFileDownload, faFileExport, faInfo, faPaintBrush, faSave} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NeMappings} from '../../models/ne-mappings';
import {NeGroupedMappingsDiscrete} from '../../models/ne-grouped-mappings-discrete';
import {UtilityService} from '../../services/utility.service';
import {NeNetwork} from '../../models/ne-network';
import {ParseService} from '../../services/parse.service';

@Component({
  selector: 'app-sidebar-manage',
  templateUrl: './sidebar-manage.component.html',
  styleUrls: ['./sidebar-manage.component.scss']
})

/**
 * Component responsible for graph selection and file management
 */
export class SidebarManageComponent {


  constructor(public dataService: DataService,
              private http: HttpClient,
              private utilityService: UtilityService,
              private parseService: ParseService) {
  }

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
   * File from local computer to import
   */
  fileToUpload: File = null;

  /**
   * Factor to display bytes as megabytes
   *
   * @private
   */
  private readonly megaFactor = 1000000;

  /**
   * Options required for HTTP requests to public NDEx API
   *
   * @private
   */
  private readonly options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /**
   * NDEx's public API endpoint
   * @private
   */
  private readonly ndexPublicApiHost = 'http://public.ndexbio.org/v2/';

  /**
   * Link to NDEx network which is to be loaded
   */
  ndexLinkToUpload: string = null;


  /**
   * Boolean to disaply the file-is-too-large-alert
   */
  showFileSizeTooLargeAlert = false;

  /**
   * Boolean to display the file-size-ok-alert
   */
  showFileSizeOkAlert = false;

  /**
   * Boolean to display the file-extension-invalid-alert
   */
  showFileNotValidAlert = false;

  /**
   * File size limit in MB
   */
  sizeLimit = 20;

  /**
   * Current file size
   */
  currentFileSize: number;

  /**
   * Current file extension
   */
  invalidExtension: string;

  /**
   * Collapsing a continuous mapping into the definition string which can be interpreted by NDEx
   *
   * @param col column
   * @param t datatype
   * @param lCollection collection of lower values
   * @param eCollection collection of equal values
   * @param gCollection collection of greater values
   * @param ovCollection collection of threshold values
   * @param defaultLower value of default lowest threshold
   * @param defaultGreater value of default highest threshold
   * @private
   */
  private static collapseContinuousMappingIntoString(col: string,
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

  /**
   * Collapsing a discrete mapping into the definition string which can be interpreted by NDEx
   *
   * @param col column
   * @param t datatype
   * @param kCollection collection of keys
   * @param vCollection collection of values
   * @private
   */
  private static collapseDiscreteMappingIntoString(col: string, t: string, kCollection: string[], vCollection: string[]): string {
    if (kCollection.length !== vCollection.length || kCollection.length === 0) {
      return '';
    }

    const partials = [];
    let i = 0;
    let index = i;
    for (i; i < kCollection.length; i++) {
      if (vCollection[i] !== undefined && vCollection[i] !== '') {
        partials.push('K=' + index + '=' + kCollection[i]);
        partials.push('V=' + index + '=' + vCollection[i]);
        index++;
      }
    }
    if (partials.length > 0) {
      return 'COL=' + col + ',T=' + t + ',' + partials.join(',');
    } else {
      return '';
    }
  }

  /**
   * Loads down the converted network in .cx format
   *
   * @param fileData data generated by {@link SidebarManageComponent#reconvert}
   * @param filename name of file is either the network's name or its iternal ID
   * @private
   */
  private static downloadFile(fileData: BlobPart[], filename: string): void {
    const blob = new Blob([JSON.stringify(fileData)], {type: 'application/octet-stream'});
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename + '.cx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  }

  /**
   * Cleans out the three utility classes which are added to the network on import
   *
   * @param network network to be cleaned
   * @private
   */
  private static cleanoutUtilStyles(network: NeNetwork): NeNetwork {
    network.style = network.style.filter(x => x.selector !== '.hide_label' && x.selector !== '.text-wrap' && x.selector !== '.custom_highlight_color');
    for (const element of network.elements) {
      element.data.classes = element.data.classes.filter(x => x !== 'hide_label' && x !== 'text-wrap' && x !== 'custom_highlight_color');
      element.classes = element.data.classes.join(' ');
    }
    return network;
  }

  /**
   * Builds the download file based on the originally given file. Since currently it is merely possible to
   * change mappings, only these parts of the data are overridden
   *
   * @param originalData originally given file data
   * @param mappingsNodes mappings regarding nodes
   * @param mappingsEdges mappings regarding edges
   * @param network the given network
   * @private
   */
  private static buildDownloadFile(originalData: any[],
                                   mappingsNodes: NeMappings[],
                                   mappingsEdges: NeMappings[],
                                   network: NeNetwork): void {
    for (const aspect of originalData) {
      if (aspect.cyVisualProperties) {
        for (const cvp of aspect.cyVisualProperties) {
          switch (cvp.properties_of) {
            case 'nodes:default':
              if (mappingsNodes.length > 0) {
                cvp.mappings = {};
                for (const nodeMap of mappingsNodes) {
                  cvp.mappings[nodeMap.key] = {
                    type: nodeMap.type,
                    definition: nodeMap.definition
                  };
                }
              }
              break;
            case 'edges:default':
              if (mappingsEdges.length > 0) {
                cvp.mappings = {};
                for (const edgeMap of mappingsEdges) {
                  cvp.mappings[edgeMap.key] = {
                    type: edgeMap.type,
                    definition: edgeMap.definition,
                  };
                }
              }
              break;
          }
        }
      }
    }
    let newFilename;
    if (network.networkInformation.name) {
      newFilename = UtilityService.utilCleanString(network.networkInformation.name);
    } else {
      newFilename = 'network_' + network.id;
    }
    SidebarManageComponent.downloadFile(originalData, newFilename);
  }

  /**
   * Converts a network to .cx file format
   *
   * @param id network's id
   */
  reconvert(id: number): void {
    let network = this.dataService.networksParsed.find(x => x.id === id);
    network = SidebarManageComponent.cleanoutUtilStyles(network);
    let mappingsNodes: NeMappings[] = [];
    let mappingsEdges: NeMappings[] = [];

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

    if (network.networkInformation.originalFilename.startsWith('/assets/mocks')) {
      // work with local mock-file
      const originalFile = this.http.get(network.networkInformation.originalFilename)
        .subscribe((originalData: any[]) => SidebarManageComponent.buildDownloadFile(originalData, mappingsNodes, mappingsEdges, network));
    } else {
      // work with file from networksDownloaded
      const originalData = this.dataService.networksDownloaded[id];
      SidebarManageComponent.buildDownloadFile(originalData, mappingsNodes, mappingsEdges, network);
    }


  }

  /**
   * Builds collections from existing discrete mappings to prepare building of definition string
   *
   * @param dMapping discrete mapping to be converted
   * @private
   */
  private buildDiscreteMappingDefinition(dMapping: NeGroupedMappingsDiscrete): NeMappings[] {

    // todo fix interaction on edges
    const newMappings: NeMappings[] = [];
    const col = dMapping.classifier;

    for (const style of dMapping.styleMap) {

      for (const val of style.cssValues) {
        const property = {
          key: style.cssKey,
          value: val
        };

        const selector = style.selectors[style.cssValues.indexOf(val)];

        for (const lookup of this.utilityService.lookup(property, selector, 'cytoscape', 'ndex')) {
          const kCollection = [];
          const vCollection = [];
          const t = dMapping.datatype;

          for (const value of dMapping.values) {
            kCollection.push(value);
            vCollection.push(style.cssValues[dMapping.values.indexOf(value)]);
          }

          const newMap: NeMappings = {
            key: lookup.cssKey,
            type: 'DISCRETE',
            definition: SidebarManageComponent.collapseDiscreteMappingIntoString(col, t, kCollection, vCollection)
          };

          if (newMap.definition !== ''
            && (!newMappings.map(x => x.key).includes(newMap.key)
              || !newMappings.map(x => x.definition).includes(newMap.definition))) {
            newMappings.push(newMap);
          }
        }
      }
    }
    return newMappings;
  }

  /**
   * Builds collections from existing continuous mappings to prepare building of definition string
   *
   * @param cMapping
   * @private
   */
  private buildContinuousMappingDefinition(cMapping: any): NeMappings[] {
    const newMappings: NeMappings[] = [];
    const col = cMapping.title[1];

    for (const lookup of this.utilityService.lookupKey(cMapping.title[0], 'cytoscape', 'ndex')) {
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

        const defaultLower = cMapping.chart.lineChartData[0].data[0];
        const defaultGreater = cMapping.chart.lineChartData[0].data[cMapping.chart.lineChartData[0].data.length - 1];

        const newNumericMapping: NeMappings = {
          key: lookup,
          type: 'double',
          definition: SidebarManageComponent.collapseContinuousMappingIntoString(col,
            'double', lCollection, eCollection, gCollection, ovCollection, defaultLower, defaultGreater)
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

        const defaultLower = cMapping.colorGradient.find(x => x.offset === '-1').color;
        const defaultGreater = cMapping.colorGradient.find(x => x.offset === '101').color;
        const newColorMapping: NeMappings = {
          key: lookup,
          type: 'double',
          definition: SidebarManageComponent.collapseContinuousMappingIntoString(col,
            'double', lCollection, eCollection, gCollection, ovCollection, defaultLower, defaultGreater),
        };
        newMappings.push(newColorMapping);
      }
    }

    return newMappings;
  }

  /**
   * Adds a selected file from the local harddrive to the application, triggers its conversion and makes it displayable.
   */
  importLocalFile(): void {
    if (!this.fileToUpload) {
      return;
    } else {

      this.fileToUpload.text()
        .then(data => {
          this.dataService.networksDownloaded.push(JSON.parse(data));
          this.dataService.networksParsed.push(this.parseService.convert(JSON.parse(data), UtilityService.utilCleanString(this.fileToUpload.name)));
        })
        .catch(error => console.log(error));
    }
  }

  /**
   * Imports data from NDEx. Works with link to publicly accessible network or just its ID
   */
  importFromNdex(): void {
    const slashSplit = this.ndexLinkToUpload.split('/');

    this.http.get(this.ndexPublicApiHost + 'network/' + slashSplit[slashSplit.length - 1], this.options)
      .toPromise()
      .then((data: any[]) => {

        let networkName = String(this.dataService.networksDownloaded.length);
        for (const d of data) {
          if (d.networkAttributes) {
            for (const prop of d.networkAttributes) {
              if (d.n === 'name') {
                networkName = d.networkAttributes.name;
              }
            }
          }
        }
        this.dataService.networksDownloaded.push(data);
        this.dataService.networksParsed.push(this.parseService.convert(data, UtilityService.utilCleanString(networkName)));

      })
      .catch(error => console.log(error));
  }

  /**
   * Sets file to be uploaded from local directory. If an error with the file exists, it displays alerts.
   * Validations include correct file extension (.cx) and size limit of 20 MB.
   *
   * @param event ChangeEvent is triggered on selection of a local file or the aborted selection
   */
  setAndValidateFile(event: Event): void {

    if (event.target.files && event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];
    } else {
      return;
    }

    const pointSplit = this.fileToUpload.name.split('.');
    const fileExtension = pointSplit[pointSplit.length - 1];
    this.currentFileSize = Number((this.fileToUpload.size / this.megaFactor).toFixed(2));

    // current file limit is set to 20MB, which has proofen to overload the application
    if (this.fileToUpload.size > (this.sizeLimit * this.megaFactor)) {
      this.showFileSizeTooLargeAlert = true;
      this.showFileSizeOkAlert = false;
      this.showFileNotValidAlert = false;
      this.fileToUpload = null;

      setTimeout(() => {
        this.showFileSizeTooLargeAlert = false;
      }, 5000);

    } else if (fileExtension !== 'cx') {

      this.invalidExtension = fileExtension;
      this.showFileNotValidAlert = true;
      this.showFileSizeOkAlert = false;
      this.showFileSizeTooLargeAlert = false;
      this.fileToUpload = null;

      setTimeout(() => {
        this.showFileNotValidAlert = false;
      }, 5000);

    } else {

      this.showFileSizeOkAlert = true;
      this.showFileSizeTooLargeAlert = false;
      this.showFileNotValidAlert = false;

      setTimeout(() => {
        this.showFileSizeOkAlert = false;
      }, 5000);
    }
  }
}
