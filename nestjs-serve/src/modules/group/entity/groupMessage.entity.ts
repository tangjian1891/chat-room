import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';


/**
 * 群消息表
 */
@Entity()
export class GroupMessage {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  userId: string;

  @Column()
  groupId: string;

  @Column()
  content: string;

  @Column()
  messageType: string;

  @Column()
  avatar:string; //图片头像地址


  @Column('double')
  time: number;
}
