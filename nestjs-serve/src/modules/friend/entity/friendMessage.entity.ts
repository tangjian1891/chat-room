import { Entity, Column, PrimaryGeneratedColumn, Double } from 'typeorm';
// 数据命名时 自动将驼峰拆为下划线  friend_message
@Entity()
export class FriendMessage {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  roomId:string;  //聊天的房间id。可以用来确定所有的好友聊天隶属于哪两个用户

  @Column()
  userId: string;//用户id 也是sendUserId

  @Column()
  friendId: string; //好友id 也是receiveUserId

  @Column()
  content: string; //聊天内容

  @Column()
  messageType: string; //内容类型

  @Column({ type:'double', default: new Date().getTime() })
  time: number;
}