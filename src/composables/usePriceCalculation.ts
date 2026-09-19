import { type SelectedCustomization } from '@/types/customization'

export function usePriceCalculation() {
  // Calculate total customization modifiers
  const calculateCustomizationTotal = (customizations: SelectedCustomization[]): number => {
    return customizations.reduce((total, c) => total + c.priceModifier, 0)
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
    formatPrice,
    formatCurrency,
  }
}