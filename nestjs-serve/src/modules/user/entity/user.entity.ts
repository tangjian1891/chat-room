import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ default: '吴彦祖' })
  username: string;

  @Column({ default: '123456' })
  password: string;

  @Column({ default: 'wuyanzu.png' })
  avatar: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: '' })
  tag: string;

  @Column({ type: 'double', default: new Date().getTime() })
  createTime: number;
}