import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsuariosService {

    async createUsuario(createUserDto: CreateUserDto) {}
}
