import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class ListToDriveDTO {
  @IsNotEmpty({ message: 'please check or uncheck box' })
  is_email_notifications: string;
  @IsNotEmpty({ message: 'please check or uncheck box' })
  is_mob_notifications: string;
  @IsNotEmpty({ message: 'please check or uncheck box' })
  is_driver_expert: string;

  @IsOptional()
  liscense_photo: string;

  @IsOptional()
  id_card_photo: string;

  @IsOptional()
  insurance_card_photo: string;

  @IsOptional()
  registration_card_photo: string;

  @IsOptional()
  profile_photo: string;

  @IsOptional()
  city_state:string;
}
