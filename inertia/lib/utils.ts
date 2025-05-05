import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Kết hợp đối tượng className từ clsx và tailwind-merge
 * Sử dụng cho các kiểu tùy chỉnh động
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format một số thành định dạng tiền tệ
 */
export function formatCurrency(amount: number, currency = 'VND', locale = 'vi-VN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format một date thành chuỗi theo định dạng ngày/tháng/năm
 */
export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date và time theo múi giờ Việt Nam (UTC+7)
 * Hỗ trợ nhiều định dạng thời gian đầu vào (MySQL, ISO, etc.)
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) {
    console.warn('formatDateTime: Missing date string')
    return 'N/A'
  }
  try {
    // Tạo đối tượng Date từ chuỗi
    const date = new Date(dateString)

    // Kiểm tra nếu date không hợp lệ
    if (Number.isNaN(date.getTime())) {
      console.warn('formatDateTime: Invalid date format:', dateString)
      return 'N/A'
    }

    // Lấy thời gian hiện tại và đồng hồ máy tính để tính toán offset
    const now = new Date()
    const localOffset = now.getTimezoneOffset() * 60000 // offset tính bằng milliseconds
    
    // Múi giờ Việt Nam là UTC+7 (tức là -7 giờ so với UTC)
    const vnOffset = -7 * 60 * 60000 // offset của VN tính bằng milliseconds
    
    // Tính toán thời gian Việt Nam
    const vnTime = new Date(date.getTime() - localOffset + vnOffset)
    
    console.log('Debug time:', {
      input: dateString,
      parsedDate: date.toISOString(),
      localOffset: localOffset / 60000, // hiển thị phút
      vnOffset: vnOffset / 60000, // hiển thị phút
      result: vnTime.toISOString(),
    })

    // Format date theo định dạng Việt Nam (DD/MM/YYYY HH:MM)
    const day = vnTime.getUTCDate().toString().padStart(2, '0')
    const month = (vnTime.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = vnTime.getUTCFullYear()
    const hours = vnTime.getUTCHours().toString().padStart(2, '0')
    const minutes = vnTime.getUTCMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString)
    return 'N/A'
  }
}

/**
 * Kiểm tra thời gian có nằm trong khoảng thời gian cho phép hay không
 * @param dateString Chuỗi thời gian cần kiểm tra
 * @param limitHours Số giờ giới hạn (mặc định là 1 giờ)
 * @returns true nếu thời gian trong khoảng cho phép, false nếu ngược lại
 */
export function isWithinTimeLimit(dateString: string, limitHours: number = 1): boolean {
  try {
    // Tạo đối tượng Date từ chuỗi thời gian
    const date = new Date(dateString)
    const now = new Date()
    
    // Kiểm tra nếu date không hợp lệ
    if (Number.isNaN(date.getTime())) {
      console.warn('isWithinTimeLimit: Invalid date format:', dateString)
      return false
    }
    
    // Tính sự chênh lệch thời gian (milliseconds)
    const timeDiff = now.getTime() - date.getTime()
    
    // Giới hạn thời gian (mặc định 1 giờ)
    const limitInMs = limitHours * 60 * 60 * 1000
    
    console.log('Debug isWithinTimeLimit:', {
      dateInput: dateString,
      dateTime: date.toISOString(),
      nowTime: now.toISOString(),
      timeDiff: timeDiff / (60 * 1000), // hiển thị phút
      limitInMinutes: limitHours * 60,
      isWithinLimit: timeDiff <= limitInMs
    })
    
    return timeDiff <= limitInMs
  } catch (error) {
    console.error('Error checking time limit:', error)
    return false
  }
}

/**
 * Hàm trì hoãn thực thi
 */
export function debounce<T extends (...args: any[]) => any>(func: T, timeout = 300) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}

/**
 * Tạo chuỗi slug từ text
 */
export function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

/**
 * Tạo ID ngẫu nhiên
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Cắt chuỗi văn bản dài
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
