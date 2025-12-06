/** Angular Imports */
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/** Material Imports */
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/** ID Document Interface */
interface IDDocument {
    type: string;
    number: string;
    file: File | null;
    preview: string | null;
}

/**
 * ID Verification Component
 * 
 * Comprehensive verification form for government IDs with
 * live photo capture and signature verification.
 */
@Component({
    selector: 'mifosx-id-verification',
    templateUrl: './id-verification.component.html',
    styleUrls: ['./id-verification.component.scss'],
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
        MatProgressSpinnerModule,
        MatSnackBarModule
    ]
})
export class IdVerificationComponent implements OnInit, AfterViewInit {
    /** Form Groups */
    documentForm: UntypedFormGroup;
    photoForm: UntypedFormGroup;
    signatureForm: UntypedFormGroup;

    /** Canvas References */
    @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;
    @ViewChild('photoCanvas') photoCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('signatureCanvas') signatureCanvas: ElementRef<HTMLCanvasElement>;

    /** ID Document Types */
    documentTypes = [
        { value: 'aadhar', label: 'Aadhar Card', pattern: '^[0-9]{12}$', placeholder: '12-digit Aadhar number' },
        { value: 'pan', label: 'PAN Card', pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', placeholder: 'ABCDE1234F' },
        { value: 'voter', label: 'Voter ID', pattern: '^[A-Z]{3}[0-9]{7}$', placeholder: 'ABC1234567' },
        { value: 'driving', label: 'Driving License', pattern: '^[A-Z]{2}[0-9]{13}$', placeholder: 'DL1234567890123' }
    ];

    /** Uploaded Documents */
    uploadedDocuments: IDDocument[] = [];

    /** Webcam State */
    stream: MediaStream | null = null;
    isCameraActive: boolean = false;
    capturedPhoto: string | null = null;

    /** Signature State */
    isDrawing: boolean = false;
    signatureData: string | null = null;
    private signatureContext: CanvasRenderingContext2D | null = null;

    /** Form State */
    isSubmitting: boolean = false;
    isSubmitted: boolean = false;

    /**
     * @param {UntypedFormBuilder} formBuilder Form Builder
     * @param {MatSnackBar} snackBar Snack Bar
     */
    constructor(
        private formBuilder: UntypedFormBuilder,
        private snackBar: MatSnackBar
    ) { }

    /**
     * Initialize the component and forms
     */
    ngOnInit() {
        this.createForms();
    }

    /**
     * After view initialization
     */
    ngAfterViewInit() {
        // Signature canvas will be initialized when user reaches that step
    }

    /**
     * Create all form groups
     */
    createForms() {
        this.documentForm = this.formBuilder.group({
            documentType: ['', [Validators.required]],
            documentNumber: ['', [Validators.required]],
            documentFile: [null, [Validators.required]]
        });

        this.photoForm = this.formBuilder.group({
            photoCapture: [null, [Validators.required]]
        });

        this.signatureForm = this.formBuilder.group({
            signatureCapture: [null, [Validators.required]]
        });
    }

    /**
     * Get selected document type details
     */
    getSelectedDocumentType() {
        const type = this.documentForm.get('documentType')?.value;
        return this.documentTypes.find(doc => doc.value === type);
    }

    /**
     * Handle document type change
     */
    onDocumentTypeChange() {
        const docType = this.getSelectedDocumentType();
        if (docType) {
            this.documentForm.get('documentNumber')?.setValidators([
                Validators.required,
                Validators.pattern(docType.pattern)
            ]);
            this.documentForm.get('documentNumber')?.updateValueAndValidity();
        }
    }

    /**
     * Handle file selection for ID document
     */
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (!file.type.match(/image\/(jpeg|jpg|png|pdf)/)) {
                this.snackBar.open('Please upload an image (JPEG, PNG) or PDF file', 'Close', { duration: 3000 });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                this.documentForm.patchValue({ documentFile: file });

                // Store temporarily for preview
                const tempDoc: IDDocument = {
                    type: this.documentForm.get('documentType')?.value,
                    number: this.documentForm.get('documentNumber')?.value,
                    file: file,
                    preview: file.type.includes('pdf') ? null : preview
                };
                this.uploadedDocuments = [tempDoc];
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Add document to list
     */
    addDocument() {
        if (this.documentForm.valid) {
            const doc: IDDocument = {
                type: this.documentForm.get('documentType')?.value,
                number: this.documentForm.get('documentNumber')?.value,
                file: this.documentForm.get('documentFile')?.value,
                preview: this.uploadedDocuments[0]?.preview || null
            };

            // Check if document type already exists
            const existingIndex = this.uploadedDocuments.findIndex(d => d.type === doc.type);
            if (existingIndex >= 0) {
                this.uploadedDocuments[existingIndex] = doc;
                this.snackBar.open('Document updated successfully', 'Close', { duration: 2000 });
            } else {
                this.uploadedDocuments.push(doc);
                this.snackBar.open('Document added successfully', 'Close', { duration: 2000 });
            }

            // Reset form for next document
            this.documentForm.reset();
        }
    }

    /**
     * Remove document from list
     */
    removeDocument(index: number) {
        this.uploadedDocuments.splice(index, 1);
        this.snackBar.open('Document removed', 'Close', { duration: 2000 });
    }

    /**
     * Get document type label
     */
    getDocumentLabel(type: string): string {
        return this.documentTypes.find(doc => doc.value === type)?.label || type;
    }

    /**
     * Start webcam for photo capture
     */
    async startCamera() {
        try {
            // Set camera active first to show the video element
            this.isCameraActive = true;

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            // Small delay to ensure video element is rendered
            setTimeout(() => {
                if (this.videoElement) {
                    this.videoElement.nativeElement.srcObject = this.stream;
                }
            }, 100);
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.isCameraActive = false;
            this.snackBar.open('Unable to access camera. Please check permissions.', 'Close', { duration: 3000 });
        }
    }

    /**
     * Capture photo from webcam
     */
    capturePhoto() {
        if (this.videoElement && this.photoCanvas) {
            const video = this.videoElement.nativeElement;
            const canvas = this.photoCanvas.nativeElement;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                this.capturedPhoto = canvas.toDataURL('image/jpeg');
                this.photoForm.patchValue({ photoCapture: this.capturedPhoto });
                this.stopCamera();
                this.snackBar.open('Photo captured successfully', 'Close', { duration: 2000 });
            }
        }
    }

    /**
     * Retake photo
     */
    retakePhoto() {
        this.capturedPhoto = null;
        this.photoForm.patchValue({ photoCapture: null });
        this.startCamera();
    }

    /**
     * Stop webcam
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isCameraActive = false;
        }
    }

    /**
     * Initialize signature pad
     */
    initSignaturePad() {
        if (this.signatureCanvas) {
            const canvas = this.signatureCanvas.nativeElement;
            this.signatureContext = canvas.getContext('2d');

            if (this.signatureContext) {
                this.signatureContext.strokeStyle = '#000000';
                this.signatureContext.lineWidth = 2;
                this.signatureContext.lineCap = 'round';
            }
        }
    }

    /**
     * Start drawing signature
     */
    startDrawing(event: MouseEvent | TouchEvent) {
        this.isDrawing = true;
        const canvas = this.signatureCanvas.nativeElement;
        const rect = canvas.getBoundingClientRect();

        let x, y;
        if (event instanceof MouseEvent) {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        }

        if (this.signatureContext) {
            this.signatureContext.beginPath();
            this.signatureContext.moveTo(x, y);
        }
    }

    /**
     * Draw signature
     */
    draw(event: MouseEvent | TouchEvent) {
        if (!this.isDrawing) return;

        const canvas = this.signatureCanvas.nativeElement;
        const rect = canvas.getBoundingClientRect();

        let x, y;
        if (event instanceof MouseEvent) {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        }

        if (this.signatureContext) {
            this.signatureContext.lineTo(x, y);
            this.signatureContext.stroke();
        }
    }

    /**
     * Stop drawing signature
     */
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveSignature();
        }
    }

    /**
     * Save signature
     */
    saveSignature() {
        if (this.signatureCanvas) {
            this.signatureData = this.signatureCanvas.nativeElement.toDataURL('image/png');
            this.signatureForm.patchValue({ signatureCapture: this.signatureData });
        }
    }

    /**
     * Clear signature
     */
    clearSignature() {
        if (this.signatureCanvas && this.signatureContext) {
            const canvas = this.signatureCanvas.nativeElement;
            this.signatureContext.clearRect(0, 0, canvas.width, canvas.height);
            this.signatureData = null;
            this.signatureForm.patchValue({ signatureCapture: null });
        }
    }

    /**
     * Submit verification
     */
    submitVerification() {
        if (this.uploadedDocuments.length > 0 && this.photoForm.valid && this.signatureForm.valid) {
            this.isSubmitting = true;

            const verificationData = {
                documents: this.uploadedDocuments.map(doc => ({
                    type: doc.type,
                    number: doc.number,
                    fileName: doc.file?.name
                })),
                photo: this.capturedPhoto,
                signature: this.signatureData,
                submittedAt: new Date().toISOString()
            };

            // Simulate API call
            setTimeout(() => {
                console.log('Verification Data:', verificationData);
                this.isSubmitting = false;
                this.isSubmitted = true;
                this.snackBar.open('Verification submitted successfully!', 'Close', { duration: 3000 });
            }, 2000);
        } else {
            this.snackBar.open('Please complete all verification steps', 'Close', { duration: 3000 });
        }
    }

    /**
     * Reset verification
     */
    resetVerification() {
        this.uploadedDocuments = [];
        this.capturedPhoto = null;
        this.signatureData = null;
        this.documentForm.reset();
        this.photoForm.reset();
        this.signatureForm.reset();
        this.isSubmitted = false;
        this.stopCamera();
    }

    /**
     * Cleanup on destroy
     */
    ngOnDestroy() {
        this.stopCamera();
    }
}
