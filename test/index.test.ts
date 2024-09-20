import { describe, expect, it } from 'vitest'
import { createFy, fy } from '../src'

describe('should also run in the Node env', () => {
  it('基础请求案例-打印了各拦截器内容', async () => {
    const fy = createFy({
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
    const res = await fy.get('https://example.com/')
    // 返回值为 HTML String
    expect(res).toBeTypeOf('string')
  })
  it('捕获错误后, 返回 onError 的返回值', async () => {
    const fy = createFy({
      beforeRequest: (method) => {
        console.log('Global beforeRequest', method)
        return method
      },
      responded: {
        onSuccess: (response, method, data) => {
          console.log('Global onSuccess', response, method, data)
          return data
        },
        onError: (error, method) => {
          console.log('Global onError', error.message, method)
          // 如果这里不抛出错误，会触发请求位置的 onSuccess
          // throw error
          return 'error res'
        },
        onComplete: (method) => {
          console.log('Global onComplete', method)
        },
      },
    })
    // 模拟请求失败
    fy.addAfterInterceptor(async () => {
      throw new Error('after interceptor error')
    })
    const res = await fy.get('https://example.com/')
    expect(res).toEqual('error res')
  })
  it('捕获错误后, 可继续抛出错误', async () => {
    const fy = createFy({
      beforeRequest: (method) => {
        console.log('Global beforeRequest', method)
        return method
      },
      responded: {
        onSuccess: (response, method, data) => {
          console.log('Global onSuccess', response, method, data)
          return data
        },
        onError: (error, method) => {
          console.log('Global onError', error.message, method)
          throw error
        },
        onComplete: (method) => {
          console.log('Global onComplete', method)
        },
      },
    })
    // 模拟请求失败
    fy.addAfterInterceptor(async () => {
      throw new Error('after interceptor error')
    })
    const res = () => fy.get('https://example.com/')
    expect(res).rejects.toThrowError('after interceptor error')
  })
  it('fy默认实例', async () => {
    const res1 = await fy.get('https://example.com/')
    expect(res1).toBeTypeOf('string')

    // fy默认实例没有拦截器, 请求异常会直接抛出
    // 模拟请求失败
    fy.addAfterInterceptor(async () => {
      throw new Error('after interceptor error')
    })
    const res = () => fy.get('https://example.com/')
    expect(res).rejects.toThrowError('after interceptor error')

    // 为实例添加拦截器会影响后续所有请求, 请注意
    const res2 = () => fy.get('https://example.com/')
    expect(res2).rejects.toThrowError('after interceptor error')
  })
})
