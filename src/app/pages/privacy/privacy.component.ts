import { Component, inject, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';


@Component({
  selector: 'privacy',
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit {

  constructor(private messageService: NzNotificationService,
    private fb: UntypedFormBuilder) { }

  ngOnInit() {
  }
}
