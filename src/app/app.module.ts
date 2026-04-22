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
import { AuthenticatedLayoutComponent } from './pages/authenticated/authenticated-layout/authenticated-layout.component';
import { SubjectsComponent } from './pages/authenticated/subjects/subjects.component';
import { ActivitiesComponent } from './pages/authenticated/activities/activities.component';
import { FilesComponent } from './pages/authenticated/files/files.component';
import { FlashcardsComponent } from './pages/authenticated/flashcards/flashcards.component';
import { ProfileSubscriptionComponent } from './pages/authenticated/profile-subscription/profile-subscription.component';
import { ConfirmActionModalComponent } from './components/confirm-action-modal/confirm-action-modal.component';
import { GroupViewCardComponent } from './components/group-view-card/group-view-card.component';
import { UpcomingActivitiesCardComponent } from './components/upcoming-activities-card/upcoming-activities-card.component';
import { EntityUpsertModalComponent } from './components/entity-upsert-modal/entity-upsert-modal.component';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { GroupUpsertModalComponent } from './components/group-upsert-modal/group-upsert-modal.component';
import { GroupCardComponent } from './components/group-card/group-card.component';
import { PaginationControlsComponent } from './components/pagination-controls/pagination-controls.component';
import { GroupDetailsModalComponent } from './components/group-details-modal/group-details-modal.component';
import { SortFiltersComponent } from './components/sort-filters/sort-filters.component';
import { PricingPlansComponent } from './components/pricing-plans/pricing-plans.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    HomeComponent,
    SideBarComponent,
    ConfirmActionModalComponent,
    AuthenticatedLayoutComponent,
    SubjectsComponent,
    ActivitiesComponent,
    FilesComponent,
    FlashcardsComponent,
    ProfileSubscriptionComponent,
    PillButtonComponent,
    FormCardComponent,
    AppSubmitButtonComponent,
    InputGroupComponent,
    RegisterModalComponent,
    LoginModalComponent,
    ToastContainerComponent,
    ForgotPasswordModalComponent,
    EqualizeModalButtonsDirective,
    GroupViewCardComponent,
    UpcomingActivitiesCardComponent,
    EntityUpsertModalComponent,
    GroupFormComponent,
    GroupUpsertModalComponent,
    GroupCardComponent,
    PaginationControlsComponent,
    GroupDetailsModalComponent,
    SortFiltersComponent,
    PricingPlansComponent
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
