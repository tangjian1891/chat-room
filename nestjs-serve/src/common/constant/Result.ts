export enum Code {
  OK = 1000,
  ERROR = 1001, //出错了，一般是500自己的程序错误
}

interface ResultDto {
  message: string,
  data?: [] | object,
  code: number
}

export const Result = (result: ResultDto) => {
  const { message, data = [], code } = result
  return { message, data, code }
}