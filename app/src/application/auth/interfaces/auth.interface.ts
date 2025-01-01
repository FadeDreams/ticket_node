// src/auth/interfaces/auth.interface.ts
import { AuthDto } from '../../../domain/auth/dtos/auth.dto';

export interface IAuthService {
    signup(createUserDto: AuthDto): Promise<{ jwt: string } | { message: string }>;
    signin(signinDto: AuthDto): Promise<{ jwt: string } | { message: string }>;
}
