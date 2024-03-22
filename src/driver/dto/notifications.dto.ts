import { IsNotEmpty, IsBoolean } from 'class-validator';

export class NotficationsDTO {
  @IsNotEmpty({ message: 'please select any value' })
  @IsBoolean({ message: 'value can either be checked or unchecked' })
  is_email_notifications: boolean;

  @IsNotEmpty({ message: 'please select any value' })
  @IsBoolean({ message: 'value can either be checked or unchecked' })
  is_mob_notifications: boolean;
}
