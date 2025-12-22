import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export type cartItem = {
  id: string
  price: number
  quantity: number
}

export const useShoppingCart = defineStore('shopping-cart', () => {
  const localCart = useStorage<cartItem[]>('shopping-cart', [], localStorage)
  const totalPrice = computed(() => {
    const total = localCart.value.reduce((acc, val) => {
      acc += val.price * val.quantity
      return acc
    }, 0)
    return total
  })
  const selectedNaviPort = ref(0)

  const addCartItem = (item: cartItem) => {
    localCart.value = [...localCart.value, item]
  }

  const removeCartItem = (cartId: string) => {
    localCart.value = localCart.value.filter((item) => item.id !== cartId)
  }

  const updateCartItem = (cartId: string, item: cartItem) => {
    localCart.value = localCart.value.map((cartItem) => {
      if (cartItem.id !== cartId) return cartItem

      return {
        ...item,
      }
    })
  }

  return {
    localCart,
    totalPrice,
    addCartItem,
    removeCartItem,
    updateCartItem,
    selectedNaviPort,
  }
})
