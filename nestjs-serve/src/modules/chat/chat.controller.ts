import { Controller, Get, Query, Post, Body } from '@nestjs/common'
// import { FriendService } from './friend.service'
import { ChatGateway } from './chat.gateway'

@Controller()
export class ChatController {
  //  只需要实例化 。顺带实现socket
  constructor(private readonly chatGateway: ChatGateway) {

  }
}

