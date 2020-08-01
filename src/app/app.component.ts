import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ParseService} from './services/parse.service';
import {NeNetwork} from './models/ne-network';
import {DataService} from './services/data.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

/**
 * Root component of the application
 */
export class AppComponent {

  /**
   * Title of the application is ndex-edit
   */
  title = 'ndex-edit';

  /**
   * Main: default page layout is 60%
   */
  widthMain = 'width-60';

  /**
   * Sidebar: default page layout is 38%
   */
  widthSidebar = 'width-38';

  /**
   * Path to mock-ups
   */
  private readonly mockedFilepath = '/assets/mocks/';

  /**
   * Array of currently supported languages, which is easily expansable
   */
  private readonly supportedLanguages = ['en', 'de'];

  /**
   * Default language is English
   */
  private readonly defaultLanguage = 'en';

  /**
   * Initializes translation and renders the desired mock-ups
   *
   * @param translateService Service to manage languages
   * @param parseService Service to handle parsing of mock-ups
   * @param dataService Service to read and write globally accessible data
   * @param http Service to handle HTTP requests and file inputs
   */
  constructor(
    public translateService: TranslateService,
    private parseService: ParseService,
    public dataService: DataService,
    private http: HttpClient) {
    this.initializeTranslation();

    this.initDemoNetwork('01.cx'); // good example for discrete mappings
    this.initDemoNetwork('02.cx'); // good example for continuous mappings
    this.initDemoNetwork('03.cx'); // good for many many many edges
    this.initDemoNetwork('05.cx'); // example with arrows
    // this.initDemoNetwork('04.cx'); // this is a terribly built network and a negative example on how to manage a .cx file
    // this.initDemoNetwork('06.cx'); // also not very nice to display
    // this.initDemoNetwork('07.cx'); // 37MB are not very nice => ndex does show a fallback graph in these cases (or only first n nodes)
    // this.initDemoNetwork('08.cx'); // 20MB are not very nice => ndex does show a fallback graph in these cases (or only first n nodes)


  }

  /**
   * Using set browser language to determine which language to use within the frontend
   */
  private initializeTranslation(): void {
    this.translateService.setDefaultLang(this.defaultLanguage);

    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use((browserLang && this.supportedLanguages.includes(browserLang)) ? browserLang : this.defaultLanguage);
  }

  /**
   * For development purposes this method loads the specified file from the assets directory and adds the files to both the
   * {@link dataService#networksDownloaded|loaded} and
   * {@link dataService#networksParsed|parsed networks} accessible through the {@link dataService|dataService}.
   * @param filename name of the file to be loaded, parsed and added
   */
  private initDemoNetwork(filename: string): void {
    this.loadFileFromAssets(filename)
      .then(network => {
        const parsedNetwork = this.parseFileFromAssets(network);
        this.dataService.networksDownloaded.push(network);
        this.dataService.networksParsed.push(parsedNetwork);
      })
      .catch(error => console.log(error));
  }

  /**
   * Method to parse the specified network from .cx to cytoscape format
   * @param network network file in .cx format
   */
  private parseFileFromAssets(network: any): NeNetwork {
    return this.parseService.mockedFiles(network);
  }

  /**
   * Method making an http request to load the file from the assets directory
   * @param filename name of the file to be loaded
   */
  private loadFileFromAssets(filename: string): Promise<any> {
    return this.http.get(this.mockedFilepath.concat(filename))
      .toPromise()
      .then(data => data)
      .catch(error => console.log(error));
  }

  /**
   * Simple implementation to adjust the page layout:
   * <ul>
   *   <li><b>left-click</b>: main view decreases, sidebar increases</li>
   *   <li><b>right-click</b>: main view increases, sidebar decreases</li>
   *   <li><b>Ctrl + left-click</b></li>: resets widths, see {@link AppComponent#resetPageLayout}
   * </ul>
   * @param e event to fetch all pressed keys
   * @param direction can be right or left
   */
  handleClickEvent(e: MouseEvent, direction: string): void {
    if (e.ctrlKey) {
      this.resetPageLayout();
      return;
    }

    e.preventDefault();
    let tmpMain = Number(this.widthMain.split('-')[1]);
    let tmpSidebar = Number(this.widthSidebar.split('-')[1]);

    if (direction === 'right' && tmpSidebar > 18) {
      tmpMain += 10;
      tmpSidebar -= 10;
      this.widthMain = 'width-' + tmpMain;
      this.widthSidebar = 'width-' + tmpSidebar;
    } else if (direction === 'left' && tmpMain > 20) {
      tmpMain -= 10;
      tmpSidebar += 10;
      this.widthMain = 'width-' + tmpMain;
      this.widthSidebar = 'width-' + tmpSidebar;
    }
  }

  /**
   * Resets page layout to {@link AppComponent#widthMain} and {@link AppComponent#widthSidebar}
   */
  resetPageLayout(): void {
    this.widthSidebar = 'width-38';
    this.widthMain = 'width-60';
  }
}
