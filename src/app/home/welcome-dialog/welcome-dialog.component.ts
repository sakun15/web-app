import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
    selector: 'mifosx-welcome-dialog',
    templateUrl: './welcome-dialog.component.html',
    styleUrls: ['./welcome-dialog.component.scss'],
    imports: [...STANDALONE_SHARED_IMPORTS, MatIconModule, MatButtonModule]
})
export class WelcomeDialogComponent {
    username: string;

    constructor(
        public dialogRef: MatDialogRef<WelcomeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.username = data?.username || 'User';
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
