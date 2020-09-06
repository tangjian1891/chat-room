import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
/**
 * 群组 表
 */
@Entity()
export class Group {
  @PrimaryGeneratedColumn("uuid")
  groupId: string;

  @Column()
  userId: string;

  @Column()
  groupName: string;

  @Column({ default: '群主很懒,没写公告' })
  notice: string;

  @Column({type: 'double',default: new Date().valueOf()})
  createTime: number;
}
/**
 * 用户和群组的关系表
 */
@Entity()
export class UserGroup {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  groupId: string;

  @Column()
  userId: string;
}

