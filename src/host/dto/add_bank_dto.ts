import { IsNotEmpty } from 'class-validator';

export class BankDTO {
  @IsNotEmpty({ message: 'bank name cannot be left empty' })
  bank_name: string;

  @IsNotEmpty({ message: 'please enter account holder name' })
  account_holder_name: string;

  @IsNotEmpty({ message: 'please enter routing no' })
  routing_no: string;

  @IsNotEmpty({ message: 'please enter account no' })
  account_no: string;
}
