import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; //连接数据库
import { UserModule } from './modules/user/user.module'
import { FriendModule } from './modules/friend/friend.module'
import { ChatModule } from './modules/chat/chat.module'
import { GroupModule } from './modules/group/group.module'
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '106.54.139.232',
      port: 3306,
      username: 'chat-test',
      password: 'mysql123456',
      database: 'chat-test',
      charset: "utf8mb4", // 设置chatset编码为utf8mb4
      autoLoadEntities: true, //自动同步实体
      synchronize: true
    }),
    UserModule, FriendModule, ChatModule, GroupModule
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule { }
