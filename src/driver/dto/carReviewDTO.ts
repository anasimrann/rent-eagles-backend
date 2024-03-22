import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class driverCarReviewDTO {
  constructor() {
    this.rating = 1;
    this.cleanliness = 1;
    this.maintenance = 1;
    this.communication = 1;
    this.convenience = 1;
    this.accuracy = 1;
  }

  @IsNumber()
  rating: number;

  @IsString({ message: 'please enter valid description' })
  @IsNotEmpty({ message: 'description should contain atleast 15 to 20 words' })
  description: string;

  @IsNumber()
  cleanliness: number;

  @IsNumber()
  maintenance: number;

  @IsNumber()
  communication: number;

  @IsNumber()
  convenience: number;

  @IsNumber()
  accuracy: number;
}
