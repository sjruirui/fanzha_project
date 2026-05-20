import type { Directive, DirectiveBinding } from 'vue'

/**
 * 图片懒加载指令
 * 使用 Intersection Observer API 检测图片是否进入可视区域
 *
 * 使用方式:
 * <img v-lazy="imageUrl" />
 * <img v-lazy="{ src: imageUrl, placeholder: '/placeholder.jpg' }" />
 */

interface LazyLoadOptions {
  src: string
  placeholder?: string
  error?: string
}

const defaultPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ELoading...%3C/text%3E%3C/svg%3E'

const defaultError = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23fee" width="400" height="300"/%3E%3Ctext fill="%23f56c6c" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E'

// 存储观察者实例
let observer: IntersectionObserver | null = null

// 初始化观察者
function initObserver() {
  if (observer) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.lazySrc

          if (src) {
            img.src = src
            img.classList.remove('lazy-loading')
            img.classList.add('lazy-loaded')
            img.removeAttribute('data-lazy-src')
            observer?.unobserve(img)
          }
        }
      })
    },
    {
      rootMargin: '50px 0px', // 提前50px开始加载
      threshold: 0.01
    }
  )
}

// 处理图片加载错误
function handleImageError(img: HTMLImageElement, errorSrc?: string) {
  img.onerror = null
  img.src = errorSrc || defaultError
  img.classList.remove('lazy-loading')
  img.classList.add('lazy-error')
}

// 处理图片加载成功
function handleImageLoad(img: HTMLImageElement) {
  img.onload = null
  img.classList.remove('lazy-loading')
  img.classList.add('lazy-loaded')
}

export const lazyLoad: Directive<HTMLImageElement, string | LazyLoadOptions> = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding<string | LazyLoadOptions>) {
    initObserver()

    // 解析参数
    let src: string
    let placeholder: string = defaultPlaceholder
    let error: string = defaultError

    if (typeof binding.value === 'string') {
      src = binding.value
    } else {
      src = binding.value.src
      if (binding.value.placeholder) placeholder = binding.value.placeholder
      if (binding.value.error) error = binding.value.error
    }

    // 设置初始状态
    el.src = placeholder
    el.dataset.lazySrc = src
    el.classList.add('lazy-loading')
    el.style.transition = 'opacity 0.3s ease'

    // 添加加载事件
    el.onload = () => handleImageLoad(el)
    el.onerror = () => handleImageError(el, error)

    // 开始观察
    observer?.observe(el)
  },

  updated(el: HTMLImageElement, binding: DirectiveBinding<string | LazyLoadOptions>) {
    let src: string

    if (typeof binding.value === 'string') {
      src = binding.value
    } else {
      src = binding.value.src
    }

    // 如果src变化，重新设置
    if (src && el.dataset.lazySrc !== src) {
      el.dataset.lazySrc = src
      el.classList.remove('lazy-loaded', 'lazy-error')
      el.classList.add('lazy-loading')

      // 如果已经在可视区域，直接加载
      const rect = el.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0

      if (isVisible) {
        el.src = src
      }
    }
  },

  unmounted(el: HTMLImageElement) {
    observer?.unobserve(el)
  }
}

export default lazyLoad
