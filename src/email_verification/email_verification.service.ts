import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email_verification.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
config();

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly jwtService: JwtService,
  ) {}

  async save(email: EmailVerification) {
    return this.emailVerificationRepository.save(email);
  }

  async findOne(
    query:
      | FindOptionsWhere<EmailVerification>
      | FindOptionsWhere<EmailVerification>[],
    select = [],
    relations = {},
  ) {
    return await this.emailVerificationRepository.findOne({
      where: query,
      select,
      relations,
    });
  }

  async generateEmailVerificationToken(user_id: number) {
    return this.jwtService.sign(
      { user_id },
      { secret: process.env.EMAIL_VERIFICATION_SECRET, expiresIn: '1h' },
    );
  }

  async verifyEmailVerificationToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.EMAIL_VERIFICATION_SECRET,
    });
  }
}
