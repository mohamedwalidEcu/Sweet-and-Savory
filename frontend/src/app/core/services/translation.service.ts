import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private http = inject(HttpClient);
  private readonly LANG_KEY = 'sweet_savory_lang';

  currentLang = signal<Language>('en');
  isRTL = signal<boolean>(false);
  private translations = signal<Record<string, any>>({});

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLang = (localStorage.getItem(this.LANG_KEY) as Language) || 'en';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    const rtl = lang === 'ar';
    this.isRTL.set(rtl);
    localStorage.setItem(this.LANG_KEY, lang);

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');

    // Load translation JSON file
    this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations.set(data);
      },
      error: () => {
        // Fallback to fetch if dev server path difference
        fetch(`assets/i18n/${lang}.json`)
          .then(res => res.json())
          .then(data => this.translations.set(data))
          .catch(err => console.warn('Could not load translation file:', err));
      }
    });
  }

  toggleLanguage(): void {
    const nextLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(nextLang);
  }

  isArabic(): boolean {
    return this.currentLang() === 'ar';
  }

  translate(path: string): string {
    if (!path) return '';
    const keys = path.split('.');
    let current: any = this.translations();

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path; // Fallback to raw key if not found
      }
    }

    return typeof current === 'string' ? current : path;
  }
}
