import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Friend } from './entity/friend.entity'
import { User } from '../user/entity/user.entity'
import { FriendMessage } from './entity/friendMessage.entity';
import { Code } from 'src/common/constant/Result';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    // TODO. 可以提PR friendMessageRepository 写成了 friendMessageResponsity
    @InjectRepository(FriendMessage)
    private readonly friendMessageRepository: Repository<FriendMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  /**
   *  根据用户id 获取好友列表
   */
  async getFriends(userId: string) {
    try {
      if (userId) {
        console.log(userId)
        const userFriendArr = await this.friendRepository.find({ userId })
        const users = []
        if (userFriendArr.length) {
          // 至少有一个好友
          // 循环 查询好友
          for (const key in userFriendArr) {
            const userFriend = userFriendArr[key]
            const user = await this.userRepository.findOne({ userId })
            users.push(user)
          }
        }
        console.log("我应该慢一点吧")
        return { msg: '获取用户好友成功', data: users }
      }
      return { msg: '获取用户好友失败', data: "" }
    } catch (error) {
      return { code: Code.ERROR, msg: '获取用户好友失败', data: error }
    }
  }


  /**
   * 获取好友的消息
   */
  async getFriendMessages(userId: string, friendId: string) {
    try {
      let data = []
      // 获取我发送给好友的消息
      const friendMessages = await this.friendMessageRepository.find({ userId, friendId })
      // 获取好友发送给我的消息
      const userMessages = await this.friendMessageRepository.find({ userId: friendId, friendId: userId })
      console.log(friendMessages,userId,friendId)
      data = [...userMessages, ...friendMessages]
      // 开始排序
      data.sort((a, b) => {
        return a.time - b.time
      })
      return { msg: "获取消息成功", data }
    } catch (error) {
      return { code: Code.ERROR, msg: '获取好友消息失败', data: error }
    }

  }
}