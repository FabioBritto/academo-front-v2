import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthenticatedLayoutComponent } from './pages/authenticated/authenticated-layout/authenticated-layout.component';
import { SubjectsComponent } from './pages/authenticated/subjects/subjects.component';
import { SubjectDetailsComponent } from './pages/authenticated/subject-details/subject-details.component';
import { ActivitiesComponent } from './pages/authenticated/activities/activities.component';
import { FilesComponent } from './pages/authenticated/files/files.component';
import { FlashcardsComponent } from './pages/authenticated/flashcards/flashcards.component';
import { ProfileSubscriptionComponent } from './pages/authenticated/profile-subscription/profile-subscription.component';
import { SubjectStudyComponent } from './pages/authenticated/subject-study/subject-study.component';
import { ActivateAccountPageComponent } from './pages/activate-account-page/activate-account-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password/reset-password-page.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'activate',
    component: ActivateAccountPageComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordPageComponent
  },
  {
    path: 'app',
    component: AuthenticatedLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'materias',
        component: SubjectsComponent
      },
      {
        path: 'materias/:id',
        component: SubjectDetailsComponent
      },
      {
        path: 'materias/:id/estudar',
        component: SubjectStudyComponent
      },
      {
        path: 'atividades',
        component: ActivitiesComponent
      },
      {
        path: 'arquivos',
        component: FilesComponent
      },
      {
        path: 'flashcards',
        component: FlashcardsComponent
      },
      {
        path: 'assinatura',
        redirectTo: 'profile-subscription',
        pathMatch: 'full'
      },
      {
        path: 'perfil',
        component: ProfileSubscriptionComponent
      },
      {
        path: 'profile-subscription',
        component: ProfileSubscriptionComponent
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
