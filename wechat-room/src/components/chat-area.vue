<template>
  <div class="chat">
    <!-- title聊天室标题 -->
    <div class="chat-title">{{group.groupName}}</div>

    <!-- 聊天室内容 -->
    <div class="chat-content" ref="chatContent">
      <div :key="index" v-for=" (msg,index) in message">
        <template v-if="msg.userId===userId">
          <div class="right">
            <div style="width:40%;">
              <div class="single-message">
                <img class="avatar" :src="`http://192.168.3.9:3000/${msg.avatar}`" alt />
                <div class="content-text">{{msg.content}}</div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="left">
            <div style="width:40%;">
              <div class="single-message">
                <img class="avatar" :src="`http://192.168.3.9:3000/${msg.avatar}`" alt />
                <div class="content-text">{{msg.content}}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 底部输入 -->
    <div class="chat-input">
      <input type="text" v-model="value" @keyup.13="send" />
      <button @click="send">发送</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "chat-area",
  props: {
    currentChat: {
      type: Object
    },
    userId: {
      type: String
    }
  },
  data() {
    return {
      value: ""
    }
  },
  computed: {
    group() {
      return this.currentChat.group || {}
    },
    message() {
      // if(this.currentChat.message&&this.currentChat.message.length)
      return this.currentChat.message || []
    }
  },
  methods: {
    send() {
      this.$emit("send", this.value)
      this.value = ""
    },
    scroll2Bottom() {
      const scrollDom = this.$refs.chatContent
      scrollDom.scrollTop = scrollDom.scrollHeight
      console.log("执行了")
    }
  }
}
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  .chat-title {
    border-bottom: 1px solid #ccc;
  }
  .chat-content {
    flex: 1;
    overflow-x: auto;
    .right {
      display: flex;
      flex-direction: row-reverse;
      .single-message {
        flex-direction: row-reverse;
        display: flex;
        // flex: 1;
      }
      .content-text {
        font-size: 18px;
        word-break: break-word;
        max-width: 450px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-right: 15px;
        position: relative;
        padding: 5px;
      }
      .content-text::after {
        content: "";
        // border-right: 20px solid #000;
        border-bottom: 5px solid transparent;
        border-left: 10px solid #ccc;
        border-top: 5px solid transparent;
        position: absolute;
        right: -10px;
        top: 10px;
      }
    }
    .left {
      display: flex;
      flex-direction: row;
      .single-message {
        display: flex;
        // flex: 1;
      }
      .content-text {
        font-size: 18px;
        width: 100%;
        text-align: left;
        border: 1px solid #ccc;
      }
    }
    .right,
    .left {
      margin: 14px 16px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
}
</style>