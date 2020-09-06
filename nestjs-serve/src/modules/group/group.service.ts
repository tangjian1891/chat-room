import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, UserGroup } from './entity/group.entity';
import { GroupMessage } from './entity/groupMessage.entity'
import { Code } from 'src/common/constant/Result';


@Injectable()
export class GroupService {
 
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private readonly groupUserRepository: Repository<UserGroup>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
  ) { }

  /**
   *  根据群组id获取群组信息
   * @param groupIds 
   */
  async postGroups(groupIds: string) {
    try {
      if (groupIds) {
        const groupIdArr = groupIds.split(',')
        const groupArr = []
        for (const key in groupIdArr) {
          const value = groupIdArr[key]
          const data = await this.groupRepository.findOne({ groupId: value })
          // 加入数组
          if (data) {
            groupArr.push(data)
          }
        }
        return { msg: "获取群消息成功", data: groupArr }
      }
      return { code: Code.ERROR, msg: '获取群信息失败', data: null }
    } catch (error) {
      return { code: Code.ERROR, msg: '获取群失败', data: error }
    }
  }


  /**
   * 获取用户自己群
   */
  async getUserGroups(userId: string) {
    try {
      let data;
      if (userId) {
        data = await this.groupUserRepository.find({ userId: userId })
        return { msg: '获取用户所有群成功', data }
      }
      data = await this.groupUserRepository.find()
      return { msg: '获取系统所有群成功', data }
    } catch (error) {
      return { code: Code.ERROR, msg: '获取用户的群失败', data: error }
    }
  }

  /**
   * 通过 组id 获取z组中所有的用户
   * @param groupId 
   */
  async getGroupUsers(groupId: string) {
    try {
      let data;
      if (groupId) {
        data = await this.groupUserRepository.find({ groupId: groupId })
        return { msg: '获取群的所有用户成功', data }
      }
    } catch (e) {
      return { code: Code.ERROR, msg: '获取群的用户失败', data: e }
    }
  }

  /**
   * 获取组中所有信息
   */
  async getGroupMessages(groupId: string) {
    try {
      let data;
      if (groupId) {
        data = await this.groupMessageRepository.find({ groupId })
        return { msg: '获取群消息成功', data }
      }
      return { msg: '获取所有群消息成功', data: [] }
    } catch (error) {
      return { code: Code.ERROR, msg: '获取群消息失败', data: error }
    }
  }

  /**
   * 通过名称搜索群
   */
  async getGroupsByName(groupName: string) {
    try {
      if (groupName) {
        const groups = await this.groupRepository.find({ groupName: Like(`%${groupName}%`) })
        return { msg: '获取群信息成功', data: groups }
      }
      return { code: Code.ERROR, msg: '请输入群昵称', data: null }
    } catch (e) {
      return { code: Code.ERROR, msg: '查找群错误', data: null }
    }
  }

/**
 * 
 * @param group 添加群
 */
 async addGroup(group: Group) {
    try {
      const isHaveGroup = await this.groupRepository.findOne({groupName: group.groupName})
      if(isHaveGroup) {
        // this.server.to(group.userId).emit('addGroup', {code:Code.ERROR, msg: '该群名字已存在', data: isHaveGroup})
        return { code: Code.ERROR, msg: '该群名字已存在', data: null }
      }
    const  data = await this.groupRepository.save(group)
      // client.join(data.groupId)
      const groupData = await this.groupUserRepository.save(data)
      // this.server.to(group.groupId).emit('addGroup', {code: Code.OK, msg: `成功创建群${groupData.groupName}`, data:group})
      return { msg: '获取群信息成功', data: groupData }
    } catch(e) {
      return { code: Code.ERROR, msg: '创建失败', data: null }
    }
  }
}