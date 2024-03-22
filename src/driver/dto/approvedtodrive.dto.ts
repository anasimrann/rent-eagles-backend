import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class approvedDriveDTO {
  is_email_notifications: string;
  is_mob_notifications: string;
  is_driver_expert: string;

  @IsOptional()
  profile_photo: string;

  @IsOptional()
  liscense_photo: string;

  @IsOptional()
  id_card_photo: string;

  @IsOptional()
  city_state:string;
}



