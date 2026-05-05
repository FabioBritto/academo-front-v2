import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { AppModule } from './app/app.module';
import 'bootstrap';

registerLocaleData(localePt);


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
