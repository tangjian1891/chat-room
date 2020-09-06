import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "ant-design-vue/dist/antd.css";
Vue.config.productionTip = false;
import { Modal, FormModel, Icon, Input, Button,message } from "ant-design-vue";
import ref from "vue-ref";
import { get, post } from "./util/request";
Vue.use(ref, { name: "ant-ref" });
Vue.component(FormModel.name, FormModel);
Vue.component(FormModel.Item.name, FormModel.Item);
Vue.component(Icon.name, Icon);
Vue.component(Input.name, Input);
Vue.component(Button.name, Button);
Vue.use(Modal);
Vue.prototype.$message = message;
Vue.prototype.$post = post;
Vue.prototype.$get = get;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
