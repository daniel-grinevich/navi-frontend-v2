import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { type CartItem } from '@/types/cart'
import { toServerItems, calculateItemTotal, cartSubtotal } from '@/lib/orderItems'

export const useShoppingCart = defineStore('shopping-cart', () => {
  const localCart = useStorage<CartItem[]>('shopping-cart', [], localStorage)
  const selectedNaviPort = ref<number | null>(null)

  const serverCart = computed(() => toServerItems(localCart.value))

  const itemCount = computed(() => {
    return localCart.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  // Tax is jurisdiction-based and computed server-side from the pickup
  // NaviPort when the order is created, so the cart only knows the pre-tax
  // subtotal. The authoritative tax/total come back on the order response.
  const subtotal = computed(() => cartSubtotal(localCart.value))

  const addCartItem = (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => {
    const cartItemId = crypto.randomUUID()
    const totalPrice = calculateItemTotal(item)

    const newItem: CartItem = {
      ...item,
      cartItemId,
      totalPrice,
    }

    localCart.value = [...localCart.value, newItem]
  }

  const removeCartItem = (cartItemId: string) => {
    localCart.value = localCart.value.filter((item) => item.cartItemId !== cartItemId)
  }

  const updateCartItem = (cartItemId: string, updated: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => {
    localCart.value = localCart.value.map((item) => {
      if (item.cartItemId !== cartItemId) return item
  
      const mergedItem: CartItem = {
        ...item,
        ...updated,
        totalPrice: calculateItemTotal(updated),
      }
  
      return mergedItem
    })
  }

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return

    localCart.value = localCart.value.map((item) => {
      if (item.cartItemId !== cartItemId) return item

      const updatedItem = { ...item, quantity }
      updatedItem.totalPrice = calculateItemTotal(updatedItem)

      return updatedItem
    })
  }

  const clearCart = () => {
    localCart.value = []
  }

  return {
    localCart,
    serverCart,
    selectedNaviPort,
    itemCount,
    subtotal,
    addCartItem,
    removeCartItem,
    updateCartItem,
    updateCartItemQuantity,
    clearCart,
  }
})
