import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class hostReviewDTO {
  constructor() {
    this.rating = 1;
  }
  @IsNotEmpty({ message: 'description should be minimum 15 to 20 words' })
  @IsString({ message: 'please enter valid description' })
  description: string;

  @IsNumber()
  rating: number;
}
