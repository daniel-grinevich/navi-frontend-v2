import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { type CartItem } from '@/types/cart'

export const useShoppingCart = defineStore('shopping-cart', () => {
  const localCart = useStorage<CartItem[]>('shopping-cart', [], localStorage)
  const selectedNaviPort = ref<number | null>(null)

  const itemCount = computed(() => {
    return localCart.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return localCart.value.reduce((acc, item) => acc + item.totalPrice, 0)
  })

  const tax = computed(() => {
    return subtotal.value * 0.08
  })

  const totalPrice = computed(() => {
    return subtotal.value + tax.value
  })

  const calculateItemTotal = (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>): number => {
    const customizationTotal = item.customizations.reduce((acc, custom) => {
      return acc + custom.priceModifier
    }, 0)

    return (item.basePrice + customizationTotal) * item.quantity
  }

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
    selectedNaviPort,
    itemCount,
    subtotal,
    tax,
    totalPrice,
    addCartItem,
    removeCartItem,
    updateCartItemQuantity,
    clearCart,
  }
})
