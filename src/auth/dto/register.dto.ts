import { IsEmail, IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsString()
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(6)
    password!: string;

    @IsNumber()
    rolId!: number;


}