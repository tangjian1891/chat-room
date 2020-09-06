<template>
  <div class="base-sidebar">
    <div class="chat-card" v-for="chat in chatData" :key="chat.groupId" @click="chooseChat(chat)">
      <div class="room-name">{{chat.group.groupName}}</div>
      <div>{{chat.message[chat.message.length-1].content}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "base-sidebar",
  props: {
    chatData: {
      type: Array
    }
  },
  methods: {
    chooseChat(chat) {
      this.$emit("chooseChat", chat)
    }
  }
}
</script>

<style lang="scss" scoped>
.base-sidebar {
  width: 100%;
  height: 100%;
  .chat-card {
    text-align: center;
    .room-name {
      font-size: 20px;
    }
    border-bottom: 1px solid red;
  }
}
</style>