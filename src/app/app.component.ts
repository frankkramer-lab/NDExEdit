import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ParseService} from './services/parse.service';
import {DataService} from './services/data.service';
import {HttpClient} from '@angular/common/http';
import {faArrowLeft, faArrowRight, faExchangeAlt, faRedo} from '@fortawesome/free-solid-svg-icons';
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
   * Icon: faExchange
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExchangeAlt = faExchangeAlt;
  /**
   * Icon: faExchange
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Icon: faExchange
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowRight = faArrowRight;
  /**
   * Icon: faExchange
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowLeft = faArrowLeft;

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

    this.initializeTranslation();

    this.initDemoNetwork('DummyForTesting.cx');
    // this.initDemoNetwork('mappings.cx');
  }

  /**
   * Using set browser language to determine which language to use within the frontend
   */
  private initializeTranslation(): void {
    this.translateService.setDefaultLang(this.defaultLanguage);

    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use((browserLang && this.supportedLanguages.includes(browserLang)) ? browserLang : this.defaultLanguage);
    this.translateService.get('MAIN_STATS_AXIS_BINS').subscribe(value => this.utilityService.xAxisContinuousLabel = value);
    this.translateService.get('MAIN_STATS_AXIS_OCCURANCES').subscribe(value => this.utilityService.yAxisLabel = value);
    this.translateService.get('MAIN_STATS_AXIS_NAMES').subscribe(value => this.utilityService.xAxisDiscreteLabel = value);
  }

  /**
   * For development purposes this method loads the specified file from the assets directory and adds the files to both the
   * {@link dataService#networksDownloaded|loaded} and
   * {@link dataService#networksParsed} accessible through the {@link dataService|dataService}.
   * @param filename name of the file to be loaded, parsed and added
   */
  private initDemoNetwork(filename: string): void {
    this.http.get(this.mockedFilepath.concat(filename))
      .toPromise()
      .then((data: any[]) => {
        this.dataService.networksDownloaded.push(data);
        this.parseService.convert(null, data, filename, '', this.dataService.nextId())
          .then(dummy => this.dataService.networksParsed.push(dummy))
          .catch(e => console.error(e));
      })
      .catch(error => console.log(error));
  }

}
