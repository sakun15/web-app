/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Material Imports */
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';

/** Progress Stage Interface */
interface ProgressStage {
    name: string;
    icon: string;
    status: 'completed' | 'active' | 'pending';
    date?: string;
    description: string;
}

/**
 * Loan Progress Tracker Component
 * 
 * Displays the progress of a loan application through various stages
 * from submission to final decision (approval/denial).
 */
@Component({
    selector: 'mifosx-loan-progress',
    templateUrl: './loan-progress.component.html',
    styleUrls: ['./loan-progress.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule,
        MatStepperModule
    ]
})
export class LoanProgressComponent implements OnInit {
    /** Application Details */
    applicationId: string = 'LA' + Date.now();
    applicantName: string = 'Your Application';
    loanAmount: number = 0;
    loanType: string = '';

    /** Progress Stages */
    stages: ProgressStage[] = [
        {
            name: 'Application Submitted',
            icon: 'check_circle',
            status: 'completed',
            date: new Date().toLocaleDateString(),
            description: 'Your loan application has been successfully submitted'
        },
        {
            name: 'Document Verification',
            icon: 'verified',
            status: 'active',
            description: 'Our team is verifying your submitted documents'
        },
        {
            name: 'Credit Check',
            icon: 'assessment',
            status: 'pending',
            description: 'Credit history and financial background check'
        },
        {
            name: 'Final Review',
            icon: 'rate_review',
            status: 'pending',
            description: 'Final review by loan approval committee'
        },
        {
            name: 'Decision',
            icon: 'gavel',
            status: 'pending',
            description: 'Loan approval or denial decision'
        }
    ];

    /** Current Status */
    currentStageIndex: number = 1;
    progressPercentage: number = 20;

    /** Final Decision */
    finalDecision: 'approved' | 'denied' | 'pending' = 'pending';
    decisionMessage: string = '';
    decisionDate: string = '';

    /** Estimated Timeline */
    estimatedDays: number = 5;

    /**
     * @param {ActivatedRoute} route Activated Route
     * @param {Router} router Router
     */
    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    /**
     * Initialize component
     */
    ngOnInit() {
        // Get application data from route params or state
        this.route.queryParams.subscribe(params => {
            if (params['applicationId']) {
                this.applicationId = params['applicationId'];
            }
            if (params['name']) {
                this.applicantName = params['name'];
            }
            if (params['amount']) {
                this.loanAmount = parseFloat(params['amount']);
            }
            if (params['type']) {
                this.loanType = params['type'];
            }
            if (params['status']) {
                this.updateProgressStatus(params['status']);
            }
        });

        // Simulate progress for demo (in real app, this would come from backend)
        this.simulateProgress();
    }

    /**
     * Simulate progress for demonstration
     * In production, this would be replaced with real API calls
     */
    simulateProgress() {
        // Simulate automatic progress every 3 seconds for demo
        let currentStage = 1;

        const interval = setInterval(() => {
            if (currentStage < this.stages.length) {
                this.advanceToNextStage();
                currentStage++;

                // If we reach the final stage, make a decision
                if (currentStage === this.stages.length) {
                    setTimeout(() => {
                        // Randomly approve or deny for demo (70% approval rate)
                        this.makeFinalDecision(Math.random() > 0.3 ? 'approved' : 'denied');
                        clearInterval(interval);
                    }, 2000);
                }
            }
        }, 3000);
    }

    /**
     * Advance to next stage
     */
    advanceToNextStage() {
        if (this.currentStageIndex < this.stages.length - 1) {
            // Mark current stage as completed
            this.stages[this.currentStageIndex].status = 'completed';
            this.stages[this.currentStageIndex].date = new Date().toLocaleDateString();

            // Move to next stage
            this.currentStageIndex++;
            this.stages[this.currentStageIndex].status = 'active';

            // Update progress percentage
            this.progressPercentage = ((this.currentStageIndex + 1) / this.stages.length) * 100;
        }
    }

    /**
     * Make final decision
     */
    makeFinalDecision(decision: 'approved' | 'denied') {
        this.finalDecision = decision;
        this.decisionDate = new Date().toLocaleDateString();

        // Mark final stage as completed
        this.stages[this.stages.length - 1].status = 'completed';
        this.stages[this.stages.length - 1].date = this.decisionDate;

        // Set progress to 100%
        this.progressPercentage = 100;

        // Set decision message
        if (decision === 'approved') {
            this.decisionMessage = 'Congratulations! Your loan application has been approved.';
            this.stages[this.stages.length - 1].icon = 'check_circle';
        } else {
            this.decisionMessage = 'We regret to inform you that your loan application has been denied.';
            this.stages[this.stages.length - 1].icon = 'cancel';
        }
    }

    /**
     * Update progress status based on backend data
     */
    updateProgressStatus(status: string) {
        const statusMap: { [key: string]: number } = {
            'submitted': 0,
            'verification': 1,
            'credit_check': 2,
            'review': 3,
            'approved': 4,
            'denied': 4
        };

        const stageIndex = statusMap[status] || 0;

        for (let i = 0; i <= stageIndex; i++) {
            this.stages[i].status = 'completed';
            this.stages[i].date = new Date().toLocaleDateString();
        }

        if (status === 'approved' || status === 'denied') {
            this.makeFinalDecision(status as 'approved' | 'denied');
        } else if (stageIndex < this.stages.length - 1) {
            this.currentStageIndex = stageIndex;
            this.stages[stageIndex].status = 'active';
            this.progressPercentage = ((stageIndex + 1) / this.stages.length) * 100;
        }
    }

    /**
     * Get status color
     */
    getStatusColor(status: string): string {
        switch (status) {
            case 'completed':
                return 'success';
            case 'active':
                return 'primary';
            default:
                return 'disabled';
        }
    }

    /**
     * Navigate to new application
     */
    newApplication() {
        this.router.navigate(['/loan-application']);
    }

    /**
     * Navigate to loan calculator
     */
    goToCalculator() {
        this.router.navigate(['/loan-calculator']);
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
}
