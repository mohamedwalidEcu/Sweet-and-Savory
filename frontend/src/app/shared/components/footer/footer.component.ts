import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

import {
  LucideZap,
  LucideMapPin,
  LucidePhone,
  LucideMail,
  LucidePizza,
  LucideDonut,
  LucideFlame,
  LucideTag
} from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    LucideZap,
    LucideMapPin,
    LucidePhone,
    LucideMail,
    LucidePizza,
    LucideDonut,
    LucideFlame,
    LucideTag
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {}
