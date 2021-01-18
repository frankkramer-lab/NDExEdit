import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ParseService} from './services/parse.service';
import {DataService} from './services/data.service';
import {HttpClient} from '@angular/common/http';
import {faRedo, faArrowRight, faArrowLeft, faExchangeAlt} from '@fortawesome/free-solid-svg-icons';

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
   * True if main view is left
   */
  layoutIsMainLeft = false;
  /**
   * Main: default page layout is 60%
   */
  widthRight = 60;
  /**
   * Sidebar: default page layout is 38%
   */
  widthLeft = 38;
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
    private http: HttpClient
  ) {

    dataService.flipLayoutEmitter.subscribe(data => {
      this.layoutIsMainLeft = data;
    });

    this.initializeTranslation();

    this.initDemoNetwork('DummyForTesting.cx');
    // this.initConvertedNetwork('input-with-converted-style.cx');
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
   * {@link dataService#networksParsed} accessible through the {@link dataService|dataService}.
   * @param filename name of the file to be loaded, parsed and added
   */
  private initDemoNetwork(filename: string): void {
    this.http.get(this.mockedFilepath.concat(filename))
      .toPromise()
      .then((data: any[]) => {
        const parsedNetwork = this.parseService.convert(data, this.mockedFilepath + filename);
        this.dataService.networksDownloaded.push(data);
        this.dataService.networksParsed.push(parsedNetwork);
      })
      .catch(error => console.log(error));
  }

  resetWidht(): void {
    if (this.widthLeft !== 38 && this.widthRight !== 60) {
      this.widthLeft = 38;
      this.widthRight = 60;
      this.dataService.triggerChartRedraw();
    }
  }

  increaseWidthLeft(): void {
    if (this.widthRight > 20) {
      this.widthRight -= 10;
      this.widthLeft += 10;
    }
  }

  increaseWidthRight(): void {
    if (this.widthLeft > 18) {
      this.widthLeft -= 10;
      this.widthRight += 10;
    }
  }

  flipLayout(): void {
    this.layoutIsMainLeft = !this.layoutIsMainLeft;
    this.dataService.flipLayoutEmitter.emit(this.layoutIsMainLeft);
  }
}
