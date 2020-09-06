import { Controller, Get, Query, Post, Body } from '@nestjs/common'
import { FriendService } from './friend.service'


@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {

  }

  /**
   * 获取好友列表
   */
  @Post()
  async getFriends(@Body('userId') userId: string) {
    return await this.friendService.getFriends(userId)
  }

  /**
   * 获取消息列表
   */
  @Post('/message')
  async getFriendMessages(@Body('userId') userId: string, @Body('friendId') friendId: string) {
    return await this.friendService.getFriendMessages(userId, friendId)
  }
}

