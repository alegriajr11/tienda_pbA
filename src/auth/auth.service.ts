import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { emit } from 'process';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService
    ) {} //Inyectamos el servicio de usuarios para poder crear un usuario en la base de datos

    async register(registerDto: RegisterDto) {
        const saltRounds = 10; //Número de rondas de sal para el hash de la contraseña
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds); //Hasheamos la contraseña del usuario
        const newUser = await this.usuariosService.createUsuario({
            ...registerDto,
            password: hashedPassword
        })
        return {
            message: 'Usuario registrado exitosamente',
            user: newUser
        }
    }

    async login(loginDto: LoginDto) {
        //1. Validar Correo
        const usuario = await this.usuariosService.findByEmail(loginDto.email, true)

        if(!usuario){
            throw new UnauthorizedException('Credenciales invalidas el correo no existe')
        }

        //2. Validar que la cuenta este activa
        if(!usuario.activo) {
            throw new UnauthorizedException ('La cuenta del usuario no se encuentra activa')
        }

        //3. Comparar la contraseña enviada con el hash de la bd
        const passwordValido = await bcrypt.compare(
            loginDto.password,
            usuario.password
        )


        if(!passwordValido){
            throw new UnauthorizedException('Credenciales invalidas la contraseña es incorrecta')
        }

        //4. Crear el payload del JWT
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre
        }

        //5. Firmar el token
        const token = await this.jwtService.signAsync(payload)

        return {
            message: 'Inicio de Sesion exitoso',
            access_token: token,
        }
    }
}
