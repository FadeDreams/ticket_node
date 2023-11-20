
import { UserService, userService } from './user/user.service'
import { AuthDto } from './dtos/auth.dto'
import { BadRequestError, AuthenticationService } from '@fadedreams7pcplatform/common'
import { NextFunction } from 'express';

export class AuthService {
  constructor(
    public userService: UserService,
    public authenticationService: AuthenticationService
  ) { }

  async signup(createUserDto: AuthDto) {
    const existingUser = await this.userService.findOneByEmail(createUserDto.email)
    if (existingUser) return { message: "email is taken" }

    const newUser = await this.userService.create(createUserDto);

    const jwt = this.authenticationService.generateJwt({ email: createUserDto.email, userId: newUser.id }, process.env.JWT_KEY!);

    return { jwt };
  }
}
export const authService = new AuthService(userService, new AuthenticationService())
