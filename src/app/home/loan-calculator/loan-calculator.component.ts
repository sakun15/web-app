/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/** Material Imports */
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

/** Loan Type Interface */
interface LoanType {
    value: string;
    label: string;
    interestRate: number;
    icon: string;
    description: string;
}

/**
 * Loan Calculator Component
 * 
 * Calculates EMI (Equated Monthly Installment), total interest, and total amount
 * for a loan based on principal, interest rate, and tenure.
 */
@Component({
    selector: 'mifosx-loan-calculator',
    templateUrl: './loan-calculator.component.html',
    styleUrls: ['./loan-calculator.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatIconModule,
        MatDividerModule,
        MatSelectModule
    ]
})
export class LoanCalculatorComponent implements OnInit {
    /** Loan Calculator Form */
    loanForm: UntypedFormGroup;

    /** Calculated Results */
    monthlyEMI: number = 0;
    totalInterest: number = 0;
    totalAmount: number = 0;

    /** Tenure in months (calculated from years if toggle is on) */
    tenureInMonths: number = 0;

    /** Toggle for tenure input (months vs years) */
    tenureInYears: boolean = false;

    /** Selected loan type */
    selectedLoanType: string = '';

    /** Available loan types with preset interest rates */
    loanTypes: LoanType[] = [
        {
            value: 'home',
            label: 'Home Loan',
            interestRate: 8.5,
            icon: 'home',
            description: 'Lowest rates for home purchase'
        },
        {
            value: 'car',
            label: 'Car Loan',
            interestRate: 9.5,
            icon: 'directions_car',
            description: 'Competitive rates for vehicle purchase'
        },
        {
            value: 'personal',
            label: 'Personal Loan',
            interestRate: 12.0,
            icon: 'person',
            description: 'Flexible loan for personal needs'
        },
        {
            value: 'education',
            label: 'Education Loan',
            interestRate: 10.5,
            icon: 'school',
            description: 'Special rates for education'
        },
        {
            value: 'business',
            label: 'Business Loan',
            interestRate: 11.5,
            icon: 'business',
            description: 'Funding for business growth'
        },
        {
            value: 'gold',
            label: 'Gold Loan',
            interestRate: 7.5,
            icon: 'star',
            description: 'Lowest rates against gold'
        },
        {
            value: 'custom',
            label: 'Custom Rate',
            interestRate: 10.0,
            icon: 'tune',
            description: 'Set your own interest rate'
        }
    ];

    /**
     * @param {UntypedFormBuilder} formBuilder Form Builder
     */
    constructor(private formBuilder: UntypedFormBuilder) { }

    /**
     * Initialize the component and form
     */
    ngOnInit() {
        this.createLoanForm();
        this.setupFormListeners();
    }

    /**
     * Create the loan calculator form with validation
     */
    createLoanForm() {
        this.loanForm = this.formBuilder.group({
            loanType: [''],
            principal: [100000, [Validators.required, Validators.min(1000), Validators.max(100000000)]],
            interestRate: [10, [Validators.required, Validators.min(0.1), Validators.max(50)]],
            tenure: [12, [Validators.required, Validators.min(1), Validators.max(360)]]
        });
    }

    /**
     * Setup form value change listeners for real-time calculation
     */
    setupFormListeners() {
        this.loanForm.valueChanges.subscribe(() => {
            if (this.loanForm.valid) {
                this.calculateLoan();
            }
        });

        // Initial calculation
        if (this.loanForm.valid) {
            this.calculateLoan();
        }
    }

    /**
     * Calculate EMI, total interest, and total amount
     * 
     * EMI Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
     * Where:
     * P = Principal loan amount
     * R = Monthly interest rate (annual rate / 12 / 100)
     * N = Loan tenure in months
     */
    calculateLoan() {
        const principal = this.loanForm.get('principal')?.value;
        const annualRate = this.loanForm.get('interestRate')?.value;
        let tenure = this.loanForm.get('tenure')?.value;

        // Convert tenure to months if in years
        this.tenureInMonths = this.tenureInYears ? tenure * 12 : tenure;

        // Calculate monthly interest rate
        const monthlyRate = annualRate / 12 / 100;

        // Calculate EMI using the formula
        if (monthlyRate === 0) {
            // If interest rate is 0, EMI is simply principal divided by tenure
            this.monthlyEMI = principal / this.tenureInMonths;
        } else {
            const emiNumerator = principal * monthlyRate * Math.pow(1 + monthlyRate, this.tenureInMonths);
            const emiDenominator = Math.pow(1 + monthlyRate, this.tenureInMonths) - 1;
            this.monthlyEMI = emiNumerator / emiDenominator;
        }

        // Calculate total amount and interest
        this.totalAmount = this.monthlyEMI * this.tenureInMonths;
        this.totalInterest = this.totalAmount - principal;

        // Round to 2 decimal places
        this.monthlyEMI = Math.round(this.monthlyEMI * 100) / 100;
        this.totalInterest = Math.round(this.totalInterest * 100) / 100;
        this.totalAmount = Math.round(this.totalAmount * 100) / 100;
    }

    /**
     * Toggle tenure between months and years
     */
    toggleTenure() {
        this.tenureInYears = !this.tenureInYears;
        const currentTenure = this.loanForm.get('tenure')?.value;

        if (this.tenureInYears) {
            // Convert months to years
            const years = Math.round(currentTenure / 12);
            this.loanForm.patchValue({ tenure: years > 0 ? years : 1 });
            this.loanForm.get('tenure')?.setValidators([Validators.required, Validators.min(1), Validators.max(30)]);
        } else {
            // Convert years to months
            const months = currentTenure * 12;
            this.loanForm.patchValue({ tenure: months });
            this.loanForm.get('tenure')?.setValidators([Validators.required, Validators.min(1), Validators.max(360)]);
        }

        this.loanForm.get('tenure')?.updateValueAndValidity();
        this.calculateLoan();
    }

    /**
     * Reset the form to default values
     */
    resetForm() {
        this.loanForm.reset({
            loanType: '',
            principal: 100000,
            interestRate: 10,
            tenure: 12
        });
        this.tenureInYears = false;
        this.selectedLoanType = '';
    }

    /**
     * Handle loan type selection and auto-populate interest rate
     */
    onLoanTypeChange(loanTypeValue: string) {
        this.selectedLoanType = loanTypeValue;
        const selectedType = this.loanTypes.find(type => type.value === loanTypeValue);

        if (selectedType && loanTypeValue !== 'custom') {
            // Auto-populate interest rate for preset loan types
            this.loanForm.patchValue({
                interestRate: selectedType.interestRate
            });
        }

        // Recalculate with new interest rate
        if (this.loanForm.valid) {
            this.calculateLoan();
        }
    }

    /**
     * Get loan type label by value
     */
    getLoanTypeLabel(value: string): string {
        const loanType = this.loanTypes.find(type => type.value === value);
        return loanType ? loanType.label : '';
    }

    /**
     * Get loan type description by value
     */
    getLoanTypeDescription(value: string): string {
        const loanType = this.loanTypes.find(type => type.value === value);
        return loanType ? loanType.description : '';
    }

    /**
     * Format number with commas for better readability
     */
    formatNumber(num: number): string {
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
