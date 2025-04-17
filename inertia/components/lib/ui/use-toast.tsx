import { useEffect, useState } from "react"
import { createStore, useStore } from "zustand"

import {
  toast as sonnerToast,
} from "sonner"

type ToastActionElement = React.ReactNode

type ToastProps = {
  id: string | number
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "success" | "error" | "warning" | "info"
}

type State = {
  toasts: ToastProps[]
}

const DEFAULT_TOAST_LIMIT = 10

export const store = createStore<State>()(() => ({
  toasts: [],
}))

store.subscribe((state) => {
  if (state.toasts.length > DEFAULT_TOAST_LIMIT) {
    store.setState({
      toasts: state.toasts.slice(-DEFAULT_TOAST_LIMIT),
    })
  }
})

function useToast() {
  const [mounted, setMounted] = useState(false)
  const { toasts = [] } = useStore(store)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      toast: () => {},
      dismiss: () => {},
      toasts: [],
    }
  }

  return {
    toast: ({ ...props }: ToastProps) => {
      const variant = props.variant || "default"
      
      // Handle variants safely
      if (variant === "success" && sonnerToast.success) {
        sonnerToast.success(props.title as string, props)
      } else if (variant === "error" && sonnerToast.error) {
        sonnerToast.error(props.title as string, props)
      } else if (variant === "warning" && sonnerToast.warning) {
        sonnerToast.warning(props.title as string, props)
      } else if (variant === "info" && sonnerToast.info) {
        sonnerToast.info(props.title as string, props)
      } else {
        // Default case
        sonnerToast(props.title as string, props)
      }
    },
    dismiss: sonnerToast.dismiss,
    toasts,
  }
}

export { useToast } 