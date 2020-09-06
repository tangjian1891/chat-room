<template>
  <div>
    <div class="index">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <base-sidebar @chooseChat="chooseChat" :chatData="chatData"></base-sidebar>
      </div>
      <!-- 聊天区域 -->
      <div class="chat-area">
        <chat-area ref="chatArea" :userId="userId" @send="send" :currentChat="currentChat"></chat-area>
      </div>
    </div>

    <!-- 登录遮罩 -->
    <a-modal :maskClosable="false" :footer="null" v-model="loginMask" @ok="handleOk">
      <div class="model-title">
        <span :class="{'active':currentStatus===1}" @click="currentStatus=1">登录</span>
        <span :class="{'active':currentStatus===0}" @click="currentStatus=0">注册</span>
      </div>
      <div>
        <a-form-model layout="inline" :model="formInline" @submit.native.prevent>
          <a-form-model-item>
            <a-input v-model="formInline.username" placeholder="Username">
              <a-icon slot="prefix" type="username" style="color:rgba(0,0,0,.25)" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item>
            <a-input v-model="formInline.password" type="password" placeholder="Password">
              <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item>
            <a-button
              type="primary"
              html-type="submit"
              @click.native="handleSubmit"
              :disabled="formInline.username === '' || formInline.password === ''"
            >{{currentStatus===1?'登录':"注册"}}</a-button>
          </a-form-model-item>
        </a-form-model>
      </div>
    </a-modal>
  </div>
</template>

<script>
import BaseSidebar from "../components/base-sidebar"
import ChatArea from "../components/chat-area"
import { getUrl } from "../util/api"
import io from "socket.io-client"
var socket
export default {
  name: "index",
  components: {
    BaseSidebar,
    ChatArea
    // [Modal.name]: Modal,
  },
  data() {
    return {
      loginMask: false, //登录遮罩
      currentStatus: 1, // 1 login 0 regist
      formInline: {
        username: "",
        password: ""
      },
      isLogin: false,
      userId: "6506d735-4c35-43d2-8427-dcb2880b8ba0",
      user: {},
      chatData: [],
      currentChat: {},
      chatRoomId: []
    }
  },
  mounted() {
    // 去缓存中查询
    const user = JSON.parse(localStorage.getItem("user")) || {}
    if (Object.keys(user).length) {
      // 已经登录了,
      this.isLogin = true
      this.loginMask = false
      this.user = user
      this.userId = user.userId
      this.initSocket()
    } else {
      this.isLogin = false
      this.loginMask = true
    }
  },
  watch: {
    "chatData.length"(newVal) {
      if (!newVal) return []
      this.chatRoomId = this.chatData.map(chat => {
        return chat?.group?.groupId ?? "不知道是什么"
      })
    }
  },
  methods: {
    /**
     * 选择的聊天
     */
    chooseChat(chat) {
      this.currentChat = chat
    },
    /**
     * 发送群聊天消息
     */
    send(value) {
      socket.emit("sendGroupMessage", {
        userId: this.userId,
        groupId: this.currentChat.group.groupId,
        content: value,
        messageType: "text",
        avatar: this.user.avatar
      })
      // 直接会写到自己
      const index = this.chatRoomId.indexOf(this.currentChat.group.groupId)
      if (index > -1) {
        this.chatData[index].message.push({
          userId: this.userId,
          groupId: this.currentChat.group.groupId,
          content: value,
          messageType: "text",
          avatar: this.user.avatar
        })
        this.$nextTick(() => {
          this.$refs.chatArea.scroll2Bottom()
        })
      }
    },
    // 初始化 socket
    initSocket() {
      console.log("执行吧")
      console.log(`ws://192.168.3.9:3000?userId=${this.userId}`)
      socket = io(`ws://192.168.3.9:3000?userId=${this.userId}`)
      // this.socket = Object.freeze(socket);

      // 连接聊天室 后，需要查询所有的房间列表
      socket.on("connect", () => {
        console.log("连接聊天室成功")
        this.$message.success("聊天室接入成功")

        // 查询所有列表
        console.log("发送获取聊天请求")
        socket.emit("chatData") //希望获取所有的聊天群组，聊天人的聊天信息记录。分页，单页10条
      })

      // 接受服务端的chatData信息,默认打开阿童木聊天室
      socket.on("chatData", res => {
        console.log(res)
        this.chatData = res.data
        this.chatData.some(chat => {
          // 如果是阿童木聊天室，就默认打开
          if (chat.group.groupId === "阿童木聊天室") {
            this.currentChat = chat
            this.$nextTick(() => {
              this.$refs.chatArea.scroll2Bottom()
            })
            // 打开阿童木聊天室,重新拉取所有的阿童木聊天室的历史消息
            return
          }
        })
      })

      // 接受单个的群消息
      socket.on("groupMessage", res => {
        console.log("接受到推送了", res)
        if (res.data.userId === this.userId) return
        console.log("加入了吗")
        if (res.data.groupId) {
          // this.chatData.group
          const index = this.chatRoomId.indexOf(res.data.groupId)
          this.chatData[index].message.push(res.data)
          this.$nextTick(() => {
            this.$refs.chatArea.scroll2Bottom()
          })
        }
      })
    },

    // 暂时不知道
    handleOk() {
      console.log("关闭吧")
    },
    // 登录  注册
    async handleSubmit(e) {
      // 登录
      let res
      if (this.currentStatus === 1) {
        const params = this.formInline
        try {
          res = await this.$post(getUrl("login"), params)
        } catch (error) {
          this.$message.error(error.message, 1.5)
          return
        }
      } else {
        const params = this.formInline
        // 注册
        try {
          res = await this.$post(getUrl("regist"), params)
        } catch (error) {
          this.$message.error(error.message, 1.5)
          return
        }
      }
      this.user = res.data
      this.userId = res.data.userId
      // 放入缓存
      localStorage.setItem("user", JSON.stringify(res.data))
      this.$message.success(res.message, 1.5)
      this.loginMask = false
      this.isLogin = true
      this.initSocket()
    }
  }
}
</script>

<style lang="scss" scoped>
.index {
  width: 1000px;
  height: 720px;
  border: 1px solid blue;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.model-title span:last-child {
  margin-left: 30px;
}

.sidebar {
  width: 200px;
  height: 100%;
  border: 1px solid red;
}
.chat-area {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  border: 1px solid blue;
  width: calc(100% - 200px);
  // width: calc(200px+300px);
}

.active {
  color: skyblue;
}
</style>