import { IsNotEmpty, Matches } from 'class-validator';
export class resetPassEmailDTO {
  @IsNotEmpty({ message: 'email cannot be left empty' })
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    { message: 'please enter valid email address' },
  )
  email: string;
}
