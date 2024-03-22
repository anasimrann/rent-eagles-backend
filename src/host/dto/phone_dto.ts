import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class phoneDTO {
  @IsNotEmpty({ message: 'phone number cannot be left empty' })
  @IsPhoneNumber('PK', { message: 'please enter valid phone no' })
  phone: string;
}
