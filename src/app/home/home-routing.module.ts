/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoanCalculatorComponent } from './loan-calculator/loan-calculator.component';
import { LoanApplicationFormComponent } from './loan-application-form/loan-application-form.component';
import { IdVerificationComponent } from './id-verification/id-verification.component';
import { LoanProgressComponent } from './loan-progress/loan-progress.component';
import { LoanStatusComponent } from './loan-status/loan-status.component';

/** Custom Resolvers */
import { OfficesResolver } from '../accounting/common-resolvers/offices.resolver';

/** Home and Dashboard Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      redirectTo: '/home',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: HomeComponent,
      data: { title: 'Home' }
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      data: { title: 'Dashboard', breadcrumb: 'Dashboard' },
      resolve: {
        offices: OfficesResolver
      }
    },
    {
      path: 'loan-calculator',
      component: LoanCalculatorComponent,
      data: { title: 'Loan Calculator', breadcrumb: 'Loan Calculator' }
    },
    {
      path: 'loan-application',
      component: LoanApplicationFormComponent,
      data: { title: 'Loan Application', breadcrumb: 'Loan Application' }
    },
    {
      path: 'id-verification',
      component: IdVerificationComponent,
      data: { title: 'ID Verification', breadcrumb: 'ID Verification' }
    },
    {
      path: 'loan-progress',
      component: LoanProgressComponent,
      data: { title: 'Loan Progress', breadcrumb: 'Loan Progress' }
    },
    {
      path: 'loan-status',
      component: LoanStatusComponent,
      data: { title: 'Ongoing Loan Status', breadcrumb: 'Loan Status' }
    }
  ])

];

/**
 * Home Routing Module
 *
 * Configures the home and dashboard routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OfficesResolver]
})
export class HomeRoutingModule { }
