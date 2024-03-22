import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
export class createHostDTO {
  @IsNotEmpty({ message: 'firstname cannot be empty' })
  @IsString({ message: 'please enter valid first name' })
  first_name: string;

  @IsNotEmpty({ message: 'lastname cannot be empty' })
  @IsString({ message: 'please enter valid lasname' })
  last_name: string;

  @IsNotEmpty({ message: 'email cannot be left empty' })
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    { message: 'please enter valid email address' },
  )
  email: string;

  @IsNotEmpty({ message: 'password cannot be left empty' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,126}$/,
    {
      message:
        'Password must include one uppercase letter, one Number and one special character and must be between 8 to 126 characters',
    },
  )
  password: string;

  @IsOptional()
  email_notifications: boolean;
}
