import { Injectable } from '@nestjs/common'
import { Repository, Like } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entity/user.entity' //用户实体类
import { UserGroup } from '../group/entity/group.entity' //用户和分组关系表
import { createWriteStream } from 'fs'
import { join } from 'path'
import { Code } from 'src/common/constant/Result'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly groupUserRepository: Repository<UserGroup>,
  ) { }


  /**
    * 添加用户
    * @param {User} user
    */
  async addUser(user: User) {
    try {
      const isHave = await this.userRepository.find({ username: user.username })
      // 用户已经存在
      if (isHave.length) {
        throw '用户名重复'
      }
      // 设置内置头像
      const index = Math.round(Math.random() * 7 + 1)
      user.avatar = `avatar/avatar(${index}).png`
      // 存储用户
      const data = await this.userRepository.save(user)
      // 将用户加入默认的 聊天室
      await this.groupUserRepository.save({
        userId: data.userId,
        groupId: '阿童木聊天室'
      })
      return data
    } catch (error) {
      throw Error(error)
    }
  }


  /**
  *  登录
  * @param userId 
  * @param user 
  */
  async login(username: string, password: string) {
    try {
      if (username && password) {
        const user = await this.userRepository.findOne({
          username,
          password
        })
        if (!user) {
          throw Error('账户或密码错误!')
        }
        return user
      } else {
        throw Error('账号密码不能为空！')
      }
    } catch (error) {
      throw error
    }
  }



  /**
   * 获取 单个 用户
   * @param {String} userId
   */
  async getUser(userId: string) {
    try {
      let data
      if (userId) {
        data = await this.userRepository.findOne({
          select: ['userId', 'username', 'avatar', 'role', 'tag', 'createTime'],
          where: {
            userId
          }
        })
        return { msg: '获取用户成功', data }
      }
      return { code: Code.ERROR, msg: '获取用户信息失败', data: null }
    } catch (error) {
      return { code: Code.ERROR, meg: '获取用户失败', data: error }
    }
  }

  /**
   * 获取多个用户
   * @param {String} userIds
   */
  async postUsers(userIds: string) {
    try {
      if (userIds) {
        const userIdArr = userIds.split(',')
        const userArr = []
        // 循环查询
        userIdArr.forEach(async userId => {
          const data = await this.userRepository.findOne({
            select: ['userId', 'username', 'avatar', 'role', 'tag', 'createTime'],
            where: {
              userId
            }
          })
          userArr.push(data)
        })
        return { msg: '获取用户信息成功', data: userArr }
      }
      return { code: Code.ERROR, msg: '获取用户信息失败', data: null }
    } catch (error) {

      return { code: Code.ERROR, meg: '获取用户失败', data: error }
    }
  }





  /**
   * 更新用户
   * @param {String} userId
   * @param {User}  user
   */
  async updateUser(userId: string, user: User) {
    try {
      // 查出旧的id
      const oldUser = await this.userRepository.findOne({ userId })
      if (user.password === oldUser.password) {
        // 修改的用户名，名称也不能相同
        const isHaveName = await this.userRepository.findOne({ username: user.username })
        if (isHaveName) {
          return { code: 1, msg: '用户名重复', data: '' }
        }
        // 更新用户信息
        await this.userRepository.update(oldUser, user)
        const newUser = await this.userRepository.findOne({ userId })
        return { msg: "更新用户信息成功", data: newUser }
      }
      return { code: Code.ERROR, msg: '密码错误', data: '' }
    } catch (error) {
      return { code: Code.ERROR, msg: '更新用户信息失败', data: error }
    }
  }


  /**
   * 删除用户
   * @param {string} userId
   */
  async deleteUser(userId: string) {
    try {
      const data = await this.userRepository.delete({ userId })
      return { msg: "用户删除成功", data }
    } catch (error) {
      return { code: Code.ERROR, msg: '该用户存在', data: error }

    }
  }

  /**
   *  通过用户的名称获取用户  模糊查询用户
   * @param {string} username
   */
  async getUsersByName(username: string) {
    try {
      const users = this.userRepository.find({
        select: ['userId', 'username', 'avatar', 'role', 'tag', 'createTime'],
        where: { username: Like(`%${username}%`) }  //效率很低
      })
      return { msg: '获取用户信息成功', data: users }
    } catch (error) {
      return { code: Code.ERROR, msg: '该用户存在', data: error }
    }
  }

  /**
   * 设置用户的头像
   * @param {User} user
   * @param {File} file
   */
  async setUserAvatar(user: User, file) {
    try {
      const random = Date.now() + "&"
      const writeSream = createWriteStream(join('public/avatar', random + file.originalname))
      // 将文件写入
      writeSream.write(file.buffer)
      // 查询
      const newUser = await this.userRepository.findOne({ userId: user.userId })
      // 修改
      newUser.avatar = `api/avatar/${random}${file.originalname}`
      // 重新存
      await this.userRepository.save(newUser)
      return { msg: '修改头像成功', data: newUser }
    } catch (error) {
      return { code: Code.ERROR, msg: '修改头像失败', data: error }
    }
  }





}
