import { IsNotEmpty, Matches } from 'class-validator';

export class changePasswordDTO {
  @IsNotEmpty({ message: 'Old Password cannot be left empty' })
  old_password: string;

  @IsNotEmpty({ message: 'New Password cannot be left empty' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,126}$/,
    {
      message:
        'Password must include one uppercase letter, one Number and one special character and must be between 8 to 126 characters',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'New Password cannot be left empty' })
  confirm_password: string;
}
