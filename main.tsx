

import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { appConfig } from './src/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    ...appConfig.providers,
  ],
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
