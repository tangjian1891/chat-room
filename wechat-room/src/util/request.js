// 与后端协商一致后按项目需求配置。
import axios from "axios";
import qs from 'qs'
// 动态获取域名 无需配置，默认不配置baseURL，就是像自己发出
// const baseUrl = window.location.protocol + "//" + window.location.host + "/";

const option1 = {
  // baseURL: baseUrl,
  // retry: 2, // 超时请求次数
  // retryDelay: 1000, // 超时请求间隙
  timeout: 65000, // 超时时间
  headers: {
    // "Content-Type": "application/json;",
    "Content-Type": "application/json",
  },
};
// const option2 = JSON.parse(JSON.stringify(option1)); // 文件上传
// const option3 = JSON.parse(JSON.stringify(option1)); // 查询数据库分页
// option2.headers["content-type"] = "multipart/form-data";
// option3.headers["content-type"] = "application/x-www-form-urlencoded";
// 保留一个实例即可。
const instance = axios.create(option1);

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log("进入了请求",config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    if (response.status !== 200) {
      return Promise.reject(new Error("服务异常"));
    }
    const res = response.data; // 剥出后端返回的数据
    // 这里已经做了判断。无需在页面做判断。但是需要catch。 1000代表正常数据返回
    if (res.code === 1000) {
      // 成功
      return Promise.resolve(res);
    } else {
      // 在状态码不是1000的情况下，可能出现任何业务状态码。请在对应业务的catch中处理
      // 具体为不同业务处理 还是toast申明，一句业务而定
      return Promise.reject(res);
    }
  },
  (error) => {
    // 后端响应错误。极大可能是500。那么无须返回。直接提示即可
    return Promise.reject(error);
  }
);

// 通用get请求
export function get(url, params = {}) {
  return instance.request({
    url,
    method: "GET",
    params,
  });
}
// 通用post请求
export function post(url, data = {}) {
  return instance.request({
    url,
    method: "POST",
    data,
  });
}
