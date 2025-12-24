import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { type CartItem } from '@/types/cart'

export const useShoppingCart = defineStore('shopping-cart', () => {
  // Enhanced cart with full item details
  const localCart = useStorage<CartItem[]>('shopping-cart', [], localStorage)

  // Selected NaviPort
  const selectedNaviPort = ref<number | null>(null)

  // Computed: Total number of items
  const itemCount = computed(() => {
    return localCart.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  // Computed: Subtotal (sum of all item totals)
  const subtotal = computed(() => {
    return localCart.value.reduce((acc, item) => acc + item.totalPrice, 0)
  })

  // Computed: Tax (8%)
  const tax = computed(() => {
    return subtotal.value * 0.08
  })

  // Computed: Total price
  const totalPrice = computed(() => {
    return subtotal.value + tax.value
  })

  // Helper: Calculate item total price
  const calculateItemTotal = (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>): number => {
    const customizationTotal = item.customizations.reduce((acc, custom) => {
      return acc + custom.options.reduce((optAcc, opt) => optAcc + opt.priceModifier, 0)
    }, 0)

    return (item.basePrice + customizationTotal) * item.quantity
  }

  // Add item to cart
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

  // Remove item from cart
  const removeCartItem = (cartItemId: string) => {
    localCart.value = localCart.value.filter((item) => item.cartItemId !== cartItemId)
  }

  // Update item quantity
  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return

    localCart.value = localCart.value.map((item) => {
      if (item.cartItemId !== cartItemId) return item

      const updatedItem = { ...item, quantity }
      updatedItem.totalPrice = calculateItemTotal(updatedItem)

      return updatedItem
    })
  }

  // Clear entire cart
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