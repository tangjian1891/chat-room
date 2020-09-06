const api = {
  regist: "/nestjs/user/regist", //1. 注册接口
  getUser: "/nestjs/user", //2. 注册接口
  login: "/nestjs/user/login", //2. 登录接口
};

export const getUrl = (key) => {
  return api[key];
};
