/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/** Material Imports */
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/** EMI Payment Interface */
interface EMIPayment {
    month: number;
    year: number;
    dueDate: Date;
    amount: number;
    status: 'paid' | 'pending' | 'bounced' | 'upcoming';
    paidDate?: Date;
    principal: number;
    interest: number;
}

/** Loan Details Interface */
interface LoanDetails {
    loanId: string;
    loanType: string;
    principalAmount: number;
    interestRate: number;
    tenure: number;
    emiAmount: number;
    startDate: Date;
    endDate: Date;
}

/**
 * Ongoing Loan Status Component
 * 
 * Comprehensive dashboard showing loan status with EMI calendar,
 * payment tracking, and detailed loan information.
 */
@Component({
    selector: 'mifosx-loan-status',
    templateUrl: './loan-status.component.html',
    styleUrls: ['./loan-status.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatChipsModule,
        MatTooltipModule,
        MatProgressBarModule
    ]
})
export class LoanStatusComponent implements OnInit {
    /** Loan Details */
    loanDetails: LoanDetails = {
        loanId: 'LN' + Date.now(),
        loanType: 'Home Loan',
        principalAmount: 5000000,
        interestRate: 8.5,
        tenure: 240, // 20 years
        emiAmount: 43391,
        startDate: new Date(2023, 0, 1), // Jan 1, 2023
        endDate: new Date(2043, 0, 1) // Jan 1, 2043
    };

    /** EMI Payments */
    emiPayments: EMIPayment[] = [];

    /** Calendar View */
    currentMonth: number = new Date().getMonth();
    currentYear: number = new Date().getFullYear();
    calendarDays: any[] = [];
    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    /** Calculated Values */
    totalPaid: number = 0;
    totalPrincipalPaid: number = 0;
    totalInterestPaid: number = 0;
    outstandingBalance: number = 0;
    emisPaid: number = 0;
    emisRemaining: number = 0;
    nextEMIDate: Date | null = null;
    bouncedPayments: number = 0;

    /** Payment History Columns */
    displayedColumns: string[] = ['month', 'dueDate', 'amount', 'principal', 'interest', 'status'];

    /** Recent Payments for Table */
    recentPayments: EMIPayment[] = [];

    /**
     * @param {Router} router Router
     */
    constructor(private router: Router) { }

    /**
     * Initialize component
     */
    ngOnInit() {
        this.generateEMISchedule();
        this.calculateLoanMetrics();
        this.generateCalendar();
        this.getRecentPayments();
    }

    /**
     * Generate EMI payment schedule
     */
    generateEMISchedule() {
        const monthlyRate = this.loanDetails.interestRate / 12 / 100;
        let balance = this.loanDetails.principalAmount;
        const startDate = new Date(this.loanDetails.startDate);

        for (let i = 0; i < this.loanDetails.tenure; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);

            const interest = balance * monthlyRate;
            const principal = this.loanDetails.emiAmount - interest;
            balance -= principal;

            // Determine payment status
            let status: 'paid' | 'pending' | 'bounced' | 'upcoming' = 'upcoming';
            let paidDate: Date | undefined;

            const today = new Date();
            const monthsElapsed = this.getMonthsDifference(startDate, today);

            if (i < monthsElapsed) {
                // Simulate some bounced payments (5% chance)
                if (Math.random() < 0.05) {
                    status = 'bounced';
                } else {
                    status = 'paid';
                    paidDate = new Date(dueDate);
                    paidDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 5)); // Paid within 5 days
                }
            } else if (i === monthsElapsed) {
                status = 'pending';
            }

            this.emiPayments.push({
                month: i + 1,
                year: dueDate.getFullYear(),
                dueDate,
                amount: this.loanDetails.emiAmount,
                status,
                paidDate,
                principal,
                interest
            });
        }
    }

    /**
     * Calculate loan metrics
     */
    calculateLoanMetrics() {
        this.emisPaid = this.emiPayments.filter(p => p.status === 'paid').length;
        this.emisRemaining = this.loanDetails.tenure - this.emisPaid;
        this.bouncedPayments = this.emiPayments.filter(p => p.status === 'bounced').length;

        const paidPayments = this.emiPayments.filter(p => p.status === 'paid');
        this.totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        this.totalPrincipalPaid = paidPayments.reduce((sum, p) => sum + p.principal, 0);
        this.totalInterestPaid = paidPayments.reduce((sum, p) => sum + p.interest, 0);

        this.outstandingBalance = this.loanDetails.principalAmount - this.totalPrincipalPaid;

        const nextPayment = this.emiPayments.find(p => p.status === 'pending' || p.status === 'upcoming');
        this.nextEMIDate = nextPayment ? nextPayment.dueDate : null;
    }

    /**
     * Generate calendar for current month
     */
    generateCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        this.calendarDays = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            this.calendarDays.push({ day: null, payment: null });
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const payment = this.emiPayments.find(p =>
                p.dueDate.getDate() === day &&
                p.dueDate.getMonth() === this.currentMonth &&
                p.dueDate.getFullYear() === this.currentYear
            );

            this.calendarDays.push({ day, date, payment });
        }
    }

    /**
     * Get recent payments for table
     */
    getRecentPayments() {
        this.recentPayments = this.emiPayments
            .filter(p => p.status !== 'upcoming')
            .slice(-10)
            .reverse();
    }

    /**
     * Navigate to previous month
     */
    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.generateCalendar();
    }

    /**
     * Navigate to next month
     */
    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.generateCalendar();
    }

    /**
     * Go to current month
     */
    goToCurrentMonth() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.generateCalendar();
    }

    /**
     * Get months difference between two dates
     */
    getMonthsDifference(startDate: Date, endDate: Date): number {
        return (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth());
    }

    /**
     * Get payment status color
     */
    getStatusColor(status: string): string {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'bounced':
                return 'danger';
            default:
                return 'default';
        }
    }

    /**
     * Get payment status icon
     */
    getStatusIcon(status: string): string {
        switch (status) {
            case 'paid':
                return 'check_circle';
            case 'pending':
                return 'schedule';
            case 'bounced':
                return 'error';
            default:
                return 'radio_button_unchecked';
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount: number): string {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    /**
     * Format date
     */
    formatDate(date: Date): string {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    /**
     * Navigate to loan calculator
     */
    goToCalculator() {
        this.router.navigate(['/loan-calculator']);
    }

    /**
     * Navigate to new application
     */
    newApplication() {
        this.router.navigate(['/loan-application']);
    }
}
