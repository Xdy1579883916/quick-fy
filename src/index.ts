interface Meta {
  [key: string]: any
}

interface Method {
  url: string
  config: RequestInit
  // 用于存储请求的元数据，这些数据会在请求过程中传递给拦截器，但不会被 fetch 使用
  meta?: Meta
}

type RequestInterceptor = (method: Method) => Method | Promise<Method>
type ResponseInterceptor = (response: Response) => Response | Promise<Response>

interface RespondedHook {
  onSuccess?: (response: Response, method: Method, data: any) => any | Promise<any>
  // error 是 Error类型
  onError?: (error: Error, method: Method) => any | Promise<any>
  onComplete?: (method: Method) => void | Promise<void>
}

interface CreateFyOptions {
  beforeRequest?: RequestInterceptor
  responded?: RespondedHook
  throwHttpErrors?: boolean
}

interface FyInstance {
  request: <T = any>(url: string, init?: RequestInit, meta?: Meta) => Promise<T>
  get: <T = any>(url: string, init?: RequestInit, meta?: Meta) => Promise<T>
  post: <T = any>(url: string, init?: RequestInit, meta?: Meta) => Promise<T>
  addBeforeInterceptor: (interceptor: RequestInterceptor) => void
  addAfterInterceptor: (interceptor: ResponseInterceptor) => void
}

export function createFy(options: CreateFyOptions = {}): FyInstance {
  const beforeInterceptors: RequestInterceptor[] = []
  const afterInterceptors: ResponseInterceptor[] = []

  const { beforeRequest, responded, throwHttpErrors } = options
  // 前置拦截器
  if (beforeRequest) {
    beforeInterceptors.push(beforeRequest)
  }

  async function request<T = any>(url: string, init: RequestInit = {}, meta: Meta = {}): Promise<T> {
    let method: Method = {
      url,
      config: { ...init },
      meta,
    }

    // 执行请求前拦截器
    for (const interceptor of beforeInterceptors) {
      method = await interceptor(method)
    }

    try {
      // 使用原生 fetch 发送请求
      let response = await fetch(method.url, method.config)

      // 执行响应后拦截器
      for (const interceptor of afterInterceptors) {
        const res = await interceptor(response)
        if (res instanceof Response) {
          response = res
        }
      }

      // 处理响应
      if (!response.ok && throwHttpErrors) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data: T
      // 根据响应类型处理数据
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      }
      else {
        data = await response.text() as unknown as T
      }

      // 处理全局 responded 钩子
      if (responded) {
        data = await responded.onSuccess?.(response, method, data)
      }

      return data
    }
    catch (error: any) {
      if (responded) {
        const result = await responded.onError?.(error, method)
        return result as T
      }
      throw error
    }
    finally {
      responded?.onComplete?.(method)
    }
  }

  return {
    request,
    get: <T = any>(url: string, init?: RequestInit, meta?: Meta) => request<T>(url, { ...init, method: 'GET' }, meta),
    post: <T = any>(url: string, init?: RequestInit, meta?: Meta) => request<T>(url, {
      ...init,
      method: 'POST',
    }, meta),
    addBeforeInterceptor: (interceptor: RequestInterceptor) => beforeInterceptors.push(interceptor),
    addAfterInterceptor: (interceptor: ResponseInterceptor) => afterInterceptors.push(interceptor),
  }
}

export const fy = createFy()
