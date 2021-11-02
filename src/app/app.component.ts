import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ParseService} from './services/parse.service';
import {DataService} from './services/data.service';
import {HttpClient} from '@angular/common/http';
import {
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faArrowLeft,
  faArrowRight,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import {UtilityService} from './services/utility.service';
import {LayoutService} from './services/layout.service';

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
   * Title of the application is NDExEdit
   */
  title = 'NDExEdit';
  /**
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Icon: faArrowRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowRight = faArrowRight;
  /**
   * Icon: faArrowLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowLeft = faArrowLeft;
  /**
   * Icon: faAngleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleLeft = faAngleLeft;
  /**
   * Icon: faAngleDoubleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleDoubleLeft = faAngleDoubleLeft;
  /**
   * Icon: faAngleRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleRight = faAngleRight;
  /**
   * Selected language
   */
  browserLang;
  /**
   * Initial main view width
   */
  widthMain = 6;
  /**
   * Initial sidebar width
   */
  widthSidebar = 6;

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
   * @param layoutService Service to manage the app's layout
   * @param utilityService Service responsible for shared code
   * @param http Service to handle HTTP requests and file inputs
   */
  constructor(
    public translateService: TranslateService,
    private parseService: ParseService,
    public dataService: DataService,
    public layoutService: LayoutService,
    private utilityService: UtilityService,
    private http: HttpClient
  ) {

    this.layoutService.layoutEmitter.subscribe(layout => {
      this.widthMain = layout.main.width;
      this.widthSidebar = layout.sidebar.width;
    });

    this.initializeTranslation();
    this.initDemoFromNDEx('e89ad762-ab4b-11ea-aaef-0ac135e8bacf');
  }

  /**
   * Sets the language to the specified string
   * @param lang either 'de' for German or 'en' for English
   */
  setLanguage(lang: string): void {
    this.browserLang = lang;
    this.applyLanguage();
  }

  /**
   * Using set browser language to determine which language to use within the frontend
   */
  private initializeTranslation(): void {
    this.translateService.setDefaultLang(this.defaultLanguage);

    this.browserLang = this.translateService.getBrowserLang();

    if (!this.browserLang || !this.supportedLanguages.includes(this.browserLang)) {
      this.browserLang = this.defaultLanguage;
    }
    this.applyLanguage();
  }

  /**
   * Applies a language
   * @private
   */
  private applyLanguage(): void {
    this.translateService.use(this.browserLang);
    this.translateService.get('MAIN_STATS_AXIS_BINS').subscribe(value => this.utilityService.xAxisContinuousLabel = value);
    this.translateService.get('MAIN_STATS_AXIS_OCCURRENCES').subscribe(value => this.utilityService.yAxisLabel = value);
    this.translateService.get('MAIN_STATS_AXIS_NAMES').subscribe(value => this.utilityService.xAxisDiscreteLabel = value);
  }

  /**
   * For development purposes this method loads the specified file from the assets directory and adds the files to both the
   * {@link dataService#networksDownloaded|loaded} and
   * {@link dataService#networksParsed} accessible through the {@link dataService|dataService}.
   * Networks rendered by this method get the prefix 'Demo: '.
   * @param filename name of the file to be loaded, parsed and added
   */
  private initDemoNetwork(filename: string): void {
    this.http.get(this.mockedFilepath.concat(filename))
      .toPromise()
      .then((data: any[]) => {
        this.dataService.networksDownloaded.push(data);
        this.parseService.convert(null, data, 'DEMO', '', this.dataService.nextId())
          .then(dummy => this.dataService.networksParsed.push(dummy))
          .catch(e => console.error(e));
      })
      .catch(error => console.log(error));
  }

  /**
   * For development purposes this method loads the specified uuid from the public NDEx API on app creation.
   * Networks rendered by this method get the prefix 'Demo: '
   * @param uuid unique identifier recognised by NDEx
   * @private
   */
  private initDemoFromNDEx(uuid: string): void {
    const url = 'https://public.ndexbio.org/v2/network/' + uuid;
    this.http.get(url)
      .toPromise()
      .then((data: any[]) => {
        this.dataService.networksDownloaded.push(data);
        this.parseService.convert(null, data, 'DEMO', uuid, this.dataService.nextId())
          .then(dummy => this.dataService.networksParsed.push(dummy))
          .catch(e => console.error(e));
      })
      .catch(error => console.error(error));
  }

}
