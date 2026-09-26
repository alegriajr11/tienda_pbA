import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly usuariosService: UsuariosService) {} //Inyectamos el servicio de usuarios para poder crear un usuario en la base de datos

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
}
