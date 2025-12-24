import { type CartItem } from '@/types/cart'
import { type SelectedCustomization } from '@/types/customization'

export function usePriceCalculation() {
  // Calculate total customization modifiers
  const calculateCustomizationTotal = (customizations: SelectedCustomization[]): number => {
    return customizations.reduce((total, group) => {
      return total + group.options.reduce((optTotal, opt) => {
        return optTotal + opt.priceModifier
      }, 0)
    }, 0)
  }

  // Calculate single item total (base + customizations) * quantity
  const calculateItemTotal = (
    basePrice: number,
    customizations: SelectedCustomization[],
    quantity: number
  ): number => {
    const customizationTotal = calculateCustomizationTotal(customizations)
    return (basePrice + customizationTotal) * quantity
  }

  // Calculate cart totals
  const calculateCartTotals = (items: CartItem[], taxRate: number = 0.08) => {
    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0)
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  // Format price to 2 decimal places
  const formatPrice = (price: number): string => {
    return price.toFixed(2)
  }

  // Format price with currency symbol
  const formatCurrency = (price: number): string => {
    return `$${formatPrice(price)}`
  }

  return {
    calculateCustomizationTotal,
    calculateItemTotal,
    calculateCartTotals,
    formatPrice,
    formatCurrency,
  }
}