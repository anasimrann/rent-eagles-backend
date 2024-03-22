import { IsNotEmpty, Matches } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty({ message: "please enter valid password" })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,128})/,
    {
      message: `Password between 8 to 128 characters is acceptable,
          including at least one number,
          one uppercase, one lowercase
          and one special character`,
    }
  )
  public password: string;

  @IsNotEmpty({ message: "please enter valid confirm password" })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,128})/,
    {
      message: `Password between 8 to 128 characters is acceptable,
          including at least one number,
          one uppercase, one lowercase
          and one special character`,
    }
  )
  public confirm_password: string;
}
