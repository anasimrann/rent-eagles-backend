import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class HostUpdateBookinDTO {
  @IsNumber()
  @IsNotEmpty({ message: 'please provide ' })
  id: number;

  @IsBoolean()
  approved: boolean;

  @IsBoolean()
  reject: boolean;
}
