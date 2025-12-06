/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/** Material Imports */
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

/** Loan Type Interface */
interface LoanType {
    value: string;
    label: string;
    interestRate: number;
    icon: string;
}

/**
 * Loan Application Form Component
 * 
 * Comprehensive loan application form with personal details,
 * financial information, and loan requirements.
 */
@Component({
    selector: 'mifosx-loan-application-form',
    templateUrl: './loan-application-form.component.html',
    styleUrls: ['./loan-application-form.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatStepperModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule
    ]
})
export class LoanApplicationFormComponent implements OnInit {
    /** Form Groups */
    personalDetailsForm: UntypedFormGroup;
    financialDetailsForm: UntypedFormGroup;
    loanDetailsForm: UntypedFormGroup;

    /** Form submission status */
    isSubmitting: boolean = false;
    isSubmitted: boolean = false;

    /** File upload tracking */
    bankStatementFileName: string = '';
    salarySlipFileName: string = '';

    /** Available loan types */
    loanTypes: LoanType[] = [
        { value: 'home', label: 'Home Loan', interestRate: 8.5, icon: 'home' },
        { value: 'car', label: 'Car Loan', interestRate: 9.5, icon: 'directions_car' },
        { value: 'personal', label: 'Personal Loan', interestRate: 12.0, icon: 'person' },
        { value: 'education', label: 'Education Loan', interestRate: 10.5, icon: 'school' },
        { value: 'business', label: 'Business Loan', interestRate: 11.5, icon: 'business' },
        { value: 'gold', label: 'Gold Loan', interestRate: 7.5, icon: 'star' }
    ];

    /** Gender options */
    genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    /** Marital status options */
    maritalStatusOptions = [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
    ];

    /** Qualification options */
    qualificationOptions = [
        { value: 'high_school', label: 'High School' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'bachelors', label: 'Bachelor\'s Degree' },
        { value: 'masters', label: 'Master\'s Degree' },
        { value: 'doctorate', label: 'Doctorate' },
        { value: 'other', label: 'Other' }
    ];

    /** Employment type options */
    employmentTypeOptions = [
        { value: 'salaried', label: 'Salaried' },
        { value: 'self_employed', label: 'Self Employed' },
        { value: 'business', label: 'Business Owner' },
        { value: 'professional', label: 'Professional' },
        { value: 'retired', label: 'Retired' }
    ];

    /**
     * @param {UntypedFormBuilder} formBuilder Form Builder
     * @param {Router} router Router
     */
    constructor(
        private formBuilder: UntypedFormBuilder,
        private router: Router
    ) { }

    /**
     * Initialize the component and forms
     */
    ngOnInit() {
        this.createForms();
    }

    /**
     * Create all form groups with validation
     */
    createForms() {
        // Personal Details Form
        this.personalDetailsForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            middleName: ['', [Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            dateOfBirth: ['', [Validators.required]],
            age: [{ value: '', disabled: true }],
            gender: ['', [Validators.required]],
            maritalStatus: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            alternateMobileNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
            address: ['', [Validators.required, Validators.minLength(10)]],
            city: ['', [Validators.required]],
            state: ['', [Validators.required]],
            pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
        });

        // Financial Details Form
        this.financialDetailsForm = this.formBuilder.group({
            qualification: ['', [Validators.required]],
            employmentType: ['', [Validators.required]],
            employerName: ['', [Validators.required]],
            designation: ['', [Validators.required]],
            yearsOfExperience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
            monthlyIncome: ['', [Validators.required, Validators.min(1000)]],
            additionalIncome: ['', [Validators.min(0)]],
            existingLoans: [false],
            existingLoanAmount: ['', [Validators.min(0)]],
            panNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
            aadharNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
            bankStatement: ['', [Validators.required]],
            salarySlip: ['', [Validators.required]]
        });

        // Loan Details Form
        this.loanDetailsForm = this.formBuilder.group({
            loanType: ['', [Validators.required]],
            loanAmount: ['', [Validators.required, Validators.min(10000), Validators.max(100000000)]],
            loanTenure: ['', [Validators.required, Validators.min(6), Validators.max(360)]],
            interestRate: [{ value: '', disabled: true }],
            purpose: ['', [Validators.required, Validators.minLength(20)]],
            agreeToTerms: [false, [Validators.requiredTrue]]
        });

        // Listen to date of birth changes to calculate age
        this.personalDetailsForm.get('dateOfBirth')?.valueChanges.subscribe(dob => {
            if (dob) {
                const age = this.calculateAge(dob);
                this.personalDetailsForm.patchValue({ age }, { emitEvent: false });
            }
        });

        // Listen to loan type changes to update interest rate
        this.loanDetailsForm.get('loanType')?.valueChanges.subscribe(loanType => {
            const selectedType = this.loanTypes.find(type => type.value === loanType);
            if (selectedType) {
                this.loanDetailsForm.patchValue({ interestRate: selectedType.interestRate }, { emitEvent: false });
            }
        });
    }

    /**
     * Calculate age from date of birth
     */
    calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Submit the loan application
     */
    submitApplication() {
        if (this.personalDetailsForm.valid && this.financialDetailsForm.valid && this.loanDetailsForm.valid) {
            this.isSubmitting = true;

            // Combine all form data
            const applicationData = {
                personalDetails: this.personalDetailsForm.getRawValue(),
                financialDetails: this.financialDetailsForm.getRawValue(),
                loanDetails: this.loanDetailsForm.getRawValue(),
                submittedAt: new Date().toISOString()
            };

            // Simulate API call
            setTimeout(() => {
                console.log('Loan Application Submitted:', applicationData);
                this.isSubmitting = false;

                // Navigate to progress tracker with application details
                const loanType = this.loanTypes.find(type => type.value === applicationData.loanDetails.loanType);
                this.router.navigate(['/loan-progress'], {
                    queryParams: {
                        applicationId: 'LA' + Date.now(),
                        name: `${applicationData.personalDetails.firstName} ${applicationData.personalDetails.lastName}`,
                        amount: applicationData.loanDetails.loanAmount,
                        type: loanType?.label || 'Loan',
                        status: 'submitted'
                    }
                });
            }, 2000);
        }
    }

    /**
     * Reset the entire application
     */
    resetApplication() {
        this.personalDetailsForm.reset();
        this.financialDetailsForm.reset();
        this.loanDetailsForm.reset();
        this.isSubmitted = false;
    }

    /**
     * Navigate to loan calculator
     */
    goToCalculator() {
        this.router.navigate(['/loan-calculator']);
    }

    /**
     * Handle bank statement file upload
     * @param event File input change event
     */
    onBankStatementUpload(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.bankStatementFileName = file.name;
            this.financialDetailsForm.patchValue({ bankStatement: file.name });
            this.financialDetailsForm.get('bankStatement')?.markAsTouched();
        }
    }

    /**
     * Handle salary slip file upload
     * @param event File input change event
     */
    onSalarySlipUpload(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.salarySlipFileName = file.name;
            this.financialDetailsForm.patchValue({ salarySlip: file.name });
            this.financialDetailsForm.get('salarySlip')?.markAsTouched();
        }
    }
}
