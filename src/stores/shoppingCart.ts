import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage, StorageSerializers } from '@vueuse/core'
import { type CartItem } from '@/types/cart'
import { toServerItems, calculateItemTotal, cartSubtotal } from '@/lib/orderItems'

// What the menu/checkout need to know about a port picked via its QR sticker.
export type SelectedNaviPortInfo = {
  id: string
  slug: string
  name: string
  menu_item_ids: string[] | null
}

export const useShoppingCart = defineStore('shopping-cart', () => {
  const localCart = useStorage<CartItem[]>('shopping-cart', [], localStorage)
  // Session-scoped so the pick survives a reload or auth redirect mid-order,
  // but a stale machine isn't remembered across visits.
  const selectedNaviPort = useStorage<string | null>('navi:selected-port-id', null, sessionStorage, {
    serializer: StorageSerializers.object,
  })
  const selectedNaviPortInfo = useStorage<SelectedNaviPortInfo | null>(
    'navi:selected-port-info',
    null,
    sessionStorage,
    { serializer: StorageSerializers.object },
  )

  const selectNaviPort = (id: string, info: SelectedNaviPortInfo | null = null) => {
    selectedNaviPort.value = id
    selectedNaviPortInfo.value = info
  }

  // Info only counts while it describes the currently selected port.
  const activeNaviPortInfo = computed(() =>
    selectedNaviPortInfo.value?.id === selectedNaviPort.value ? selectedNaviPortInfo.value : null,
  )

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
    activeNaviPortInfo,
    selectNaviPort,
    itemCount,
    subtotal,
    addCartItem,
    removeCartItem,
    updateCartItem,
    updateCartItemQuantity,
    clearCart,
  }
})
