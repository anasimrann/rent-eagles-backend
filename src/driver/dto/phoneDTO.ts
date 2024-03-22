import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class phoneDTO {
  @IsNotEmpty({ message: 'please enter phone number' })
  @IsPhoneNumber('PK', { message: 'please enter in valid format' })
  phone: string;
}
