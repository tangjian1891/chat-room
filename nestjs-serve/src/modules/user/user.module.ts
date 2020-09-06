import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service'
import { UserGroup } from '../group/entity/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserGroup]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule { }
