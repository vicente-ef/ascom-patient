import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly SELECTED_LANGUAGE_KEY = 'selectedLanguage';

  title = 'Patient Management System';
  currentLanguage: string = 'en';

  availableLanguages: Language[] = [
    {code: LanguageCode.ENGLISH, name: 'English'},
    {code: LanguageCode.ITALIAN, name: 'Italiano'},
  ];

  constructor(private translate: TranslateService) {
    this.handleUserLanguage(translate);
  }

  changeLanguage(langCode: string): void {
    this.currentLanguage = langCode;
    this.translate.use(langCode);

    localStorage.setItem(this.SELECTED_LANGUAGE_KEY, langCode);
  }

  getCurrentLanguageName(): string {
    const language = this.availableLanguages.find(language => language.code === this.currentLanguage);
    return language?.name ?? 'English';
  }

  private handleUserLanguage(translate: TranslateService) {
    translate.setDefaultLang(LanguageCode.ENGLISH);
    const savedLanguage = localStorage.getItem(this.SELECTED_LANGUAGE_KEY);

    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      const browserLang = (translate.getBrowserLang() || LanguageCode.ENGLISH) as LanguageCode;
      const supportedLangs = [LanguageCode.ENGLISH, LanguageCode.ITALIAN];
      this.currentLanguage = supportedLangs.includes(browserLang) ? browserLang : LanguageCode.ENGLISH;
    }

    translate.use(this.currentLanguage);
  }

  private isLanguageSupported(languageCode: string): boolean {
    return this.availableLanguages.some(language => language.code === languageCode);
  }
}

interface Language {
  code: string;
  name: string;
}

enum LanguageCode {
  ENGLISH = 'en',
  ITALIAN = 'it',
}
