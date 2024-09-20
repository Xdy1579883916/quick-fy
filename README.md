# quick-fy

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

quick-fy 是一个轻量级、可扩展的基于 fetch 的 HTTP 请求库, 适用于浏览器和 Node.js 环境。

## 特性

- 基于原生 fetch API
- 支持请求和响应拦截器
- 提供全局钩子函数（onSuccess, onError, onComplete）
- 支持自定义元数据传递
- 类型安全，使用 TypeScript 编写

## 安装

```bash
npm install quick-fy
```

## 快速开始

```ts
import { createFy, fy } from 'quick-fy'

// 使用默认 fy 实例
await fy.get('https://example.com/')

// 创建一个新的 fy 实例
const newFy = createFy({
  beforeRequest: (method) => {
    console.log('Global beforeRequest', method)
    return method
  },
  responded: {
    onSuccess: (response, method, data) => {
      console.log('Global onSuccess', method, typeof data)
      return data
    },
    onError: (error, method) => {
      console.log('Global onError', error, method)
      throw error
    },
    onComplete: (method) => {
      console.log('Global onComplete', method)
    },
  },
})
await newFy.get('https://example.com/')
```

## 更多示例

- 参见 [测试用例](./test/index.test.ts)

## API 参考

### createFy(options)

创建一个新的 fy 实例。

参数：

- `options`: CreateFyOptions 对象

返回：

- FyInstance 对象

### FyInstance 方法

- `request<T>(url: string, init?: RequestInit, meta?: Meta): Promise<T>`
- `get<T>(url: string, init?: RequestInit, meta?: Meta): Promise<T>`
- `post<T>(url: string, init?: RequestInit, meta?: Meta): Promise<T>`
- `addBeforeInterceptor(interceptor: RequestInterceptor): void`
- `addAfterInterceptor(interceptor: ResponseInterceptor): void`

## License

[MIT](./LICENSE) License © 2024-PRESENT [XiaDeYu](https://github.com/Xdy1579883916)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/quick-fy?style=flat&colorA=080f12&colorB=1fa669

[npm-version-href]: https://npmjs.com/package/quick-fy

[npm-downloads-src]: https://img.shields.io/npm/dm/quick-fy?style=flat&colorA=080f12&colorB=1fa669

[npm-downloads-href]: https://npmjs.com/package/quick-fy

[bundle-src]: https://img.shields.io/bundlephobia/minzip/quick-fy?style=flat&colorA=080f12&colorB=1fa669&label=minzip

[bundle-href]: https://bundlephobia.com/result?p=quick-fy

[license-src]: https://img.shields.io/github/license/Xdy1579883916/quick-fy.svg?style=flat&colorA=080f12&colorB=1fa669

[license-href]: https://github.com/Xdy1579883916/quick-fy/blob/main/LICENSE
