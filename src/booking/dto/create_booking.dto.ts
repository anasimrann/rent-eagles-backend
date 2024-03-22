import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';

export class BookingDTO {
  @Type(() => Date)
  @IsDate({ message: 'please provide valid date' })
  @IsNotEmpty({ message: 'please provide start date' })
  readonly start_date: Date;

  @Type(() => Date)
  @IsDate({ message: 'please provide valid date' })
  @IsNotEmpty({ message: 'please provide end date' })
  readonly end_date: Date;

  @IsString()
  @IsNotEmpty({ message: 'please provide start time' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format. Use HH:mm.',
  })
  readonly start_time: string;

  @IsString()
  @IsNotEmpty({ message: 'please provide end time' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format. Use HH:mm.',
  })
  readonly end_time: string;

  @IsNumber()
  readonly carId: number;

  @IsString({ message: 'please enter valid address' })
  @IsNotEmpty({ message: 'address cannot be left empty' })
  readonly address: string;
}
