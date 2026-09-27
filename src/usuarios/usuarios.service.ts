import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RolService } from 'src/rol/rol.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(UsuarioEntity) 
        private readonly usuarioRepository: Repository<UsuarioEntity>,
        private readonly rolService: RolService
    ) {}


    async findByEmail(email: string, includePassword = false): Promise<UsuarioEntity | null> {
        const query = this.usuarioRepository.createQueryBuilder('usuario')
            .leftJoinAndSelect('usuario.rol', 'rol')
            .where('usuario.email = :email', {email});

        if (includePassword) {
            query.addSelect('usuario.password');
        }

        return query.getOne();

    }

    async createUsuario(createUserDto: CreateUserDto) {
        //1. Validar que el email no este repetido
        const existe = await this.findByEmail(createUserDto.email);
        if (existe) {
            throw new Error('El email ya esta registrado');
        }

        //2. Validar el rol asignado al usuario
        const rolId = createUserDto.rolId;
        const rol = await this.rolService.findOne(rolId);
        if (!rol) {
            throw new Error('El rol asignado no existe');
        }

        //3. Crear el usuario y guardarlo en la BD
        const usuario = this.usuarioRepository.create({
            nombre: createUserDto.nombre,
            email: createUserDto.email,
            password: createUserDto.password,
            rol: rol
        });
        const guardado = await this.usuarioRepository.save(usuario);

        //4. Retornar el usuario creado y omitir la contraseña en la respuesta
        const { password, ...usuarioSinPassword } = guardado;
        
        return usuarioSinPassword;
    }

}
