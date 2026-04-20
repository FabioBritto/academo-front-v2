import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { PillButtonComponent } from './components/pill-button/pill-button.component';
import { FormCardComponent } from './components/form-card/form-card.component';
import { AppSubmitButtonComponent } from './components/app-submit-button/app-submit-button.component';
import { InputGroupComponent } from './components/input-group/input-group.component';
import { RegisterModalComponent } from './components/register-modal/register-modal.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ForgotPasswordModalComponent } from './components/forgot-password-modal/forgot-password-modal.component';
import { EqualizeModalButtonsDirective } from './directives/equalize-modal-buttons.directive';
import { HomeComponent } from './pages/home/home.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    HomeComponent,
    SideBarComponent,
    PillButtonComponent,
    FormCardComponent,
    AppSubmitButtonComponent,
    InputGroupComponent,
    RegisterModalComponent,
    LoginModalComponent,
    ToastContainerComponent,
    ForgotPasswordModalComponent,
    EqualizeModalButtonsDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
