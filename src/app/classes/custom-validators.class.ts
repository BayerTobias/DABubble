import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  constructor() {}

  static emailValidator(control: AbstractControl): ValidationErrors | null {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const isValid = emailPattern.test(control.value);

    return isValid ? null : { invalidEmail: true };
  }

  static passwordLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = control.value && control.value.length >= minLength;
      return isValid
        ? null
        : {
            minLength: {
              requiredLength: minLength,
              actualLength: control.value.length,
            },
          };
    };
  }
}
