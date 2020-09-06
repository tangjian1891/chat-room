import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service'
import { GroupController } from './group.controller'
import { Group, UserGroup } from './entity/group.entity'
import { GroupMessage } from './entity/groupMessage.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, UserGroup, GroupMessage]),
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule { }
