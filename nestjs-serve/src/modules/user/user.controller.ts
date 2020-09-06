import { Controller, Post, HttpCode, Get, Body, Query, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UserService } from './user.service'
import { User } from './entity/user.entity'
import { Result, Code } from 'src/common/constant/Result'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {

  }

  /**
   * 1. 注册用户
   */
  @Post('regist')
  @HttpCode(200)
  async addUser(@Body() user: User) {
    let data
    try {
      data = await this.userService.addUser(user)
      return Result({ data, code: Code.OK, message: "注册成功！" })
    } catch (error) {
      return Result({ message: error.message, code: Code.ERROR })
    }

  }

  /**
  *  2. 登录
  */
  @Post('login')
  @HttpCode(200)
  async login(@Body() user: User) {
    try {
      const data = await this.userService.login(user.username, user.password)
      return Result({ message: '登录成功', code: Code.OK, data })
    } catch (error) {
      console.log(error)
      return Result({ message: error.message, code: Code.ERROR })
    }
  }


  /**
   * 根据id 获取用户
   */
  @Get()
  async getUser(@Query('userId') userId: string) {
    console.log(userId)
    return await this.userService.getUser(userId)
  }

  /**
   * 根据ids数组串批量获取用户
   */
  @Post()
  async postUsers(@Body('userIds') userIds: string) {
    return await this.userService.postUsers(userIds)
  }

  /**
   * 根据用户id查询用户
   */
  @Patch(':userId')
  async updateUser(@Param('userId') userId: string, @Body() user: User) {
    console.log(userId, user)
    return await this.userService.updateUser(userId, user)
  }

  /**
   * 根据用户id删除用户
   * @param {string}  userId
   */
  @Delete()
  async deleteUser(@Query('userId') userId: string) {
    return await this.userService.deleteUser(userId)
  }


  /**
   * 模糊查询用户名称
   */
  @Get('findByName')
  async getUsersByName(@Query('name') name: string) {
    return await this.userService.getUsersByName(name)
  }

  /**
   * 设置头像
   */
  @Post('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async setUserAvatar(@Body() user, @UploadedFile() file) {
    console.log(file)

    return await this.userService.setUserAvatar(user, file)
  }

}
