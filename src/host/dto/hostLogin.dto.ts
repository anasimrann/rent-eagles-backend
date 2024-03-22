import { IsNotEmpty} from "class-validator";

export class hostLoginDTO  {
    @IsNotEmpty({message:"email cannot be left empty"})
    email:string;

    @IsNotEmpty({message:"password cannot be left empty"})
    password:string;
}