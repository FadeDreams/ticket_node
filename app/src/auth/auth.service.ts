
import { UserService, userService } from './user/user.service'
import { AuthDto } from './dtos/auth.dto'
import { NextFunction } from 'express';

export class AuthService {
  constructor(
    public userService: UserService,
  ) { }

  async signup(createUserDto: AuthDto) {
    const existingUser = await this.userService.findOneByEmail(createUserDto.email)
    if (existingUser) return { message: "email is taken" }

    const newUser = await this.userService.create(createUserDto);


    return { jwt };
  }
}
export const authService = new AuthService(userService)
