
import { UserModel } from '@fadedreams7org1/common'
import { User } from '@src/domain/auth/user/user.model'
import { AuthDto } from '@src/domain/auth/dtos/auth.dto'


export class UserService {
    constructor(
        public userModel: UserModel
    ) { }

    async create(createUserDto: AuthDto) {
        const user = new this.userModel({
            email: createUserDto.email,
            password: createUserDto.password
        });

        return await user.save()
    }

    async findOneByEmail(email: string) {
        return await this.userModel.findOne({ email })
    }

}

export const userService = new UserService(User)
