import { ValueTransformer } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { KeysResponse } from './interfaces/responses';
import { CryptService } from './services/crypt.service';

function validKey(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;
        if(!value){
          return null
        }
        if (!value.includes('$')) {
            return null;
        }

        return !value.includes('$') ? {goodKey:true}: null;
    }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent implements OnInit {
  pubKey: string;
  privKey: string;
  cryptMess: string;
  plainMess: string;

  encryptForm: FormGroup;
  decryptForm: FormGroup;
  constructor(private cryptService: CryptService, private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.encryptForm = this._fb.group({
      plainText: [null, [Validators.required]],
      publicKey: [null, [Validators.pattern]],
      cryptText: [null]
    });

    this.decryptForm = this._fb.group({
      cryptText: [null, [Validators.required]],
      privateKey: [null, [Validators.pattern]],
      plainText: [null]
    });
  }

  getKeys() {
    this.cryptService.generateKeys().subscribe((res) => {
      this.privKey = res.privateKey;
      this.pubKey = res.publicKey;
    });
  }

  encryptMessage() {

    console.log(
        this.encryptForm.controls['publicKey'].value,
    )
    if (this.encryptForm.valid) {
      this.cryptService.encryptMessage(
        this.encryptForm.controls['publicKey'].value,
        this.encryptForm.controls['plainText'].value
      )
      .subscribe(
        (res) => {
          console.log(res)
          this.cryptMess = res.cryptMessage
        }
      )
    } else {
      Object.values(this.encryptForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  decryptMessage() {
    if (this.decryptForm.valid) {
      console.log("Hola")
      this.cryptService.decryptMessage(
        this.decryptForm.controls['privateKey'].value,
        this.decryptForm.controls['cryptText'].value
      )
      .subscribe(
        (res) => {
          console.log("la respuesta es", res)
          this.plainMess = res.decryptMessage
        }
      )
    } else {
      Object.values(this.decryptForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

}
