import { WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Group, UserGroup } from '../group/entity/group.entity';
import { GroupMessage } from '../group/entity/groupMessage.entity';
import { Friend } from '../friend/entity/friend.entity';
import { FriendMessage } from '../friend/entity/friendMessage.entity';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Code } from 'src/common/constant/Result';
// 装饰器初始化socket.io
// @WebSocketGateway({ origins: ['http://192.168.3.9:5500'] })
// @WebSocketGateway({ origins: '*' })
@WebSocketGateway()
export class ChatGateway {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private readonly groupUserRepository: Repository<UserGroup>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(FriendMessage)
    private readonly friendMessageRepository: Repository<FriendMessage>,
  ) {

  }
  // 挂一个服务
  @WebSocketServer()
  server: Server  //这个是io

  // 1.给指定房间的用户发送消息
  // io.to('room 237').emit('a new user has joined the room');   to(room)  单个房间

  // 2。加入房间
  // io.join(arg) arg:string|[]

  // 3. 将用户踢出房间，并给房间剩下的人发送某人离开的消息
  // socket.leave（'room 237'，（）=> { 
  //   io.to（'room 237'）.emit（`user $ {socket.id}已经离开房间`）; 
  // }）; 

  // 4. 查看当前的所有房间
  // this.server.sockets.adapter.rooms  返回的是一个key为房间的对象数组集合

  private socketData: string


  // 每个socket都是一个客户端用户
  // 连接函数 钩子函数
  async handleConnection(socket: Socket,) {
    console.log("初始化socket")
    // 获取用户的userId
    const userRoom = socket.handshake.query.userId
    // 查一下有没有默认聊天室
    const defaultGroup = await this.groupRepository.find({ groupName: '阿童木聊天室' })
    if (!defaultGroup.length) {
      // 如果默认聊天室不存在，就手动创建一个
      this.groupRepository.save({
        groupId: '阿童木聊天室',
        groupName: '阿童木聊天室',
        notice: "官方聊天群",
        userId: 'admin'
      })
    }
    // 将用户加入聊天室
    socket.join('阿童木聊天室')

    // 用户会被默认加入自己的聊天室

    console.log(this.server.sockets.adapter.rooms)

    // console.log("看下这是啥", client)
    return '连接成功了啊...'
  }

  // 断开连接函数  钩子函数
  handleDisconnect(client: any) {
    console.log("有人断开了")
    console.log(this.server.sockets.adapter.rooms)
  }

  /**
   * 用户创建 群组,客户端监听message
   * @param socket   
   * @param data 
   */
  @SubscribeMessage('addGroup')
  async addGroup(@ConnectedSocket() socket: Socket, @MessageBody() group: Group) {
    try {
      let groupData
      // 查看是否有相同的群组名称
      if (group.groupName) {
        // 查看是否有重复名字
        groupData = await this.groupRepository.findOne({ groupName: group.groupName })
        if (groupData) {
          // to指定房间，一般指定房间都是自己
          this.server.to(group.userId).emit('message', { code: Code.ERROR, msg: '该群名字已存在', data: groupData })
          return
        }
        // 可以创建
        groupData = await this.groupRepository.save(group)
        this.server.to(group.userId).emit('message', { code: Code.ERROR, msg: '该群名字已存在', data: groupData })
        return
      }
      // 群名不存在
      return
    } catch (ERROR) {
      this.server.to(group.userId).emit('message', { code: Code.ERROR, msg: '创建群失败', data: ERROR })
    }

  }


  /**
   * 加入群主
   * @param socket 
   * @param data  有userId和groupId
   */
  @SubscribeMessage('joinGroup')
  async joinGroup(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const userId = socket.handshake.query.userId
    try {
      // 查看群组。 查看群组关联的用户
      const group = await this.groupRepository.findOne({ groupId: data.groupId })
      if (!group) { //群不在了
        this.server.to(userId).emit('message', { code: Code.ERROR, msg: '该群已经不存在', data: null })
        return
      }
      const groupUser = await this.groupUserRepository.findOne({ groupId: group.groupId })
      // 自己关联不在,把自己与群关联起来
      if (!groupUser) {
        await this.groupUserRepository.save({
          userId: userId,
          groupId: group.userId
        })
      }

      // 查找自己这个人信息，将自己推到群中的所有人
      const user = await this.userRepository.findOne({ userId })
      const res = { user, group }
      // 群在 .加入其中
      socket.join(group.groupId)
      this.server.to(group.groupId).emit('joinGroup', { code: Code.OK, msg: `${user.username}加入群${group.groupName}`, data: res })

    } catch (ERROR) {
      this.server.to(userId).emit('joinGroup', { code: Code.ERROR, msg: '进群失败', data: ERROR })
    }
  }


  /**
   * 发送 消息
   * @param data 
   */
  @SubscribeMessage('sendGroupMessage')
  async sendGroupMessage(@MessageBody() data: GroupMessageDto) {
    try {
      // 查看这个人是否与群关联
      const isUserInGroup = await this.groupUserRepository.findOne({ userId: data.userId, groupId: data.groupId })
      if (!isUserInGroup) {
        this.server.to(data.userId).emit('message', { code: Code.ERROR, msg: '群消息发送错误', data: '' })
        return
      }
      // 查看信息类别
      if (data.messageType === 'image') {
        const randomName = `${Date.now()}-${data.userId}-${data.width}-${data.height}`
        const writeStream = createWriteStream(join('public/static', randomName))
        writeStream.write(data.content)
        data.content = randomName
      }
      this.groupMessageRepository.save(data)
      // 通知所有群内消息
      this.server.to(data.groupId).emit('groupMessage', { ConnectedSocket: Code.OK, msg: '', data })
    } catch (ERROR) {
      this.server.to(data.userId).emit('groupMessage', { code: Code.ERROR, msg: '群消息发送错误', data: ERROR })
    }
  }
  /**
   * 添加朋友  和朋友的聊天信息其实就是一个群组
   * @param socket 
   * @param data 
   * userId friendId
   */
  @SubscribeMessage('addFriend')
  async addFriend(@ConnectedSocket() socket: Socket, @MessageBody() data: Friend) {
    try {
      // 添加的好友和个人不能是同一个
      if (data.userId === data.friendId) {
        this.server.to(data.userId).emit('message', '不能添加自己为好友！')
        return
      }
      if (data.userId && data.friendId) {
        // 添加后，互为好友
        const isHave1 = await this.friendRepository.findOne({ userId: data.friendId, friendId: data.userId })
        const isHave2 = await this.friendRepository.findOne({ friendId: data.friendId, userId: data.userId })
        // 好友中是否存在一个
        if (isHave1 || isHave2) {
          this.server.to(data.userId).emit('message', '已经有该好友了')
          return
        }
        // 都没有。查看这个两个用户是否存在
        const user = await this.userRepository.findOne({ userId: data.userId })
        const friend = await this.userRepository.findOne({ userId: data.friendId })
        if (!friend) {
          this.server.to(data.userId).emit("message", "该用户已不存")
          return
        }
        // 双防都加入数据库
        await this.friendRepository.save({
          friendId: data.friendId,
          userId: data.userId
        })
        await this.friendRepository.save({
          userId: data.friendId,
          friendId: data.userId
        })
        // 将目标好友加入聊天,开启新的聊天窗口。将好友加入自己聊天组,
        // 发送消息给用户
        this.server.to(data.userId).emit('addFriend', { msg: '添加还有成功', data: friend })
        this.server.to(data.friendId).emit('addFriend', { msg: '被人添加了', data: user })

      }
    } catch (ERROR) {
      this.server.to(data.userId).emit('addFriend', { code: Code.ERROR, msg: '添加好友失败', data: ERROR })
    }
  }

  /**
   * 进入私聊房间
   * @param socket 
   * @param data 
   */
  @SubscribeMessage('joinFriendSocket')
  async joinFriend(@ConnectedSocket() socket: Socket, @MessageBody() data: Friend) {
    try {
      if (data.friendId && data.userId) {
        const relation = await this.friendRepository.findOne({ userId: data.userId, friendId: data.friendId })
        // 两人的房间 私人房间以两人id大小拼接而成
        const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId
        // 两人是朋友
        if (!relation) {
          // 不是朋友，不能加入
          this.server.to(data.userId).emit('message', "你们还不是好友")
          return
        }
        // 加入房间
        socket.join(roomId)
        // 加入后，通知用户，可以打开聊天窗口了
        this.server.to(data.userId).emit('joinFriendRoom', '进入房间了')

      }
    } catch (ERROR) {
      this.server.to(data.userId).emit('message', '进入私聊失败')
    }
  }

  @SubscribeMessage('friendMessage')
  async friendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: FriendMessageDto) {
    try {
      if (data.userId && data.friendId) {
        // 拼接目标房间
        const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId
        if (data.messageType === 'image') {
          const randomName = `${Date.now()}$${roomId}$${data.width}$${data.height}`
          const writeSream = createWriteStream(join('public/static', randomName))
          writeSream.write(data.content)
          data.content = randomName;
        }
        await this.friendMessageRepository.save(data) //存入数据库
        this.server.to(roomId).emit('friendMessage', data)
      }
    } catch (ERROR) {
      this.server.to(data.userId).emit('friendMessage', { code: Code.ERROR, msg: '消息发送失败', data })
    }
  }

  /**
   * 根据用户id。  查询信息
   *  
   *  查所有的好友  查单个好友的聊天记录
   *  查所有的群   查群聊的聊天记录  都为10条
   * @param client 
   * @param user 
   */
  @SubscribeMessage('chatData')
  async getChatData(@ConnectedSocket() socket: Socket, @MessageBody() user: User) {
    console.log("获取所有聊天信息")
    console.log(this.server.sockets.adapter.rooms)
    const userId = socket.handshake.query.userId
    //  1.获取所有的好友id
    // 所有好友id集合
    const friendIdArr = await this.friendRepository.find({ userId })
    // 2.所有的好友
    const allFriend = []
    for (const key in friendIdArr) {
      const friend = friendIdArr[key]
      const user = await this.userRepository.findOne({ userId: friend.friendId })
      allFriend.push(user)
    }
    // 3. 获取每一个好友的信息即可。 好友的聊天消息无须获取, 获取10条即可.

    const myFriend = [] //获取所有的好友，以及好友的第一条信息
    for (const key in allFriend) {
      const friend = allFriend[key]
      // const roomId=userId>friend.id?userId+friend.userId:friend.userId+userId
      const roomId = userId + friend.userId
      const message: FriendMessage = await this.friendMessageRepository.query(`SELECT * FROM friend_message where friend_message.roomId = ${roomId}  ORDER BY _id desc LIMIT 1`);
      myFriend.push({ message: JSON.parse(JSON.stringify(message)), user })
    }

    // 1. 开始获取用户  有多少个群组id
    const userGroupArr = await this.groupUserRepository.find({ userId: userId })
    const groupArr = []
    //2. 查询所有的群组.拿着群id。可以找到群主是谁
    for (const key in userGroupArr) {
      const groupId = userGroupArr[key].groupId
      const group = await this.groupRepository.findOne({ groupId })
      groupArr.push(group)
    }

    // 3. 用所有的群信息。去查最新的一条记录
    const myGroup = []
    // 数组
    for (const key in groupArr) {
      const group = groupArr[key]
      const message = await this.groupMessageRepository.query(`SELECT * FROM group_message where group_message.groupId = '${group.groupId}'  ORDER BY _id desc LIMIT 0,10`)
      myGroup.push({ message: JSON.parse(JSON.stringify(message.reverse())), group })
    }
    const data = [...myFriend, ...myGroup]
    data.sort((a, b) => {
      return a.message.time - b.message.time
    })
   console.log(data)
    this.server.to(socket.id).emit('chatData', { data })
  }


  /**
   * 
   * @param socket 监听所有客户端推送过来的drop,不过一般不这么推，服务器与客户端还是用ajax
   * @param data 
   */
  @SubscribeMessage('drop')
  handleDropMessage(socket: Socket, data) {
    this.server.emit("receive", this.socketData) //还是发所有人
  }
}
// 群消息
interface GroupMessageDto {
  userId: string;
  groupId: string;
  content: string;
  width?: number;
  height?: number;
  messageType: string;
  time: number;
}

// 好友消息
interface FriendMessageDto {
  userId: string;
  friendId: string;
  content: string;
  width?: number;
  height?: number;
  messageType: string;
  time: number;
}