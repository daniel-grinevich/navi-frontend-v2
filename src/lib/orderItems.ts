import type { CartItem } from '@/types/cart'
import type { ServerOrder } from '@/types/order'

// (basePrice + sum of customization modifiers) * quantity.
export const calculateItemTotal = (
  item: Pick<CartItem, 'basePrice' | 'customizations' | 'quantity'>,
): number => {
  const customizationTotal = item.customizations.reduce((acc, c) => acc + c.priceModifier, 0)
  return (item.basePrice + customizationTotal) * item.quantity
}

// Transform local cart items into the shape the orders API expects. Shared by
// the shopping-cart store and the admin manual-order builder so the two never
// drift.
export const toServerItems = (items: CartItem[]): ServerOrder['items'] =>
  items.map((item) => ({
    menu_item: item.menuItemId,
    quantity: item.quantity,
    unit_price: item.basePrice.toFixed(2),
    customizations: item.customizations.map((c) => ({
      customization: c.optionId,
      quantity: 1,
      unit_price: c.priceModifier.toFixed(2),
    })),
  }))

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((acc, item) => acc + item.totalPrice, 0)
