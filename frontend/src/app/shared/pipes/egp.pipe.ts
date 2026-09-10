import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'egp',
  standalone: true,
  pure: false, // Re-evaluates when language signal changes
})
export class EgpPipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '';
    }
    const num = Number(value);
    const formatted = num.toFixed(2);
    const isArabic = this.translationService.currentLang() === 'ar';

    if (isArabic) {
      return `${formatted} ج.م`;
    }
    return `${formatted} EGP`;
  }
}
