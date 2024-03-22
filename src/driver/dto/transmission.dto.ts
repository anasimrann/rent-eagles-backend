import { IsBoolean, IsNotEmpty } from 'class-validator';

export class isExpertDTO {
  @IsNotEmpty({ message: 'please select any value' })
  @IsBoolean({ message: 'value can either be checked or unchecked' })
  is_driver_expert: boolean;
}
