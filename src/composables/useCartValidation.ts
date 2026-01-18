import { type CustomizationGroup, type SelectedCustomization } from '@/types/customization'

export function useCartValidation() {
  // Validate that all required customization groups have selections
  const validateCustomizations = (
    groups: CustomizationGroup[],
    selections: Map<string | number, SelectedCustomization>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    groups.forEach((group) => {
      const selection = selections.get(group.id)

      if (group.is_required && !selection) {
        errors.push(`${group.name} is required`)
        return
      }

      if (selection) {
        const count = selection.options.length

        if (count < group.min_selections) {
          errors.push(`${group.name} requires at least ${group.min_selections} selection(s)`)
        }

        if (count > group.max_selections) {
          errors.push(`${group.name} allows maximum ${group.max_selections} selection(s)`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Validate cart has items and NaviPort selected
  const validateCart = (
    itemCount: number,
    selectedNaviPort: number | null
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (itemCount === 0) {
      errors.push('Cart is empty')
    }

    if (selectedNaviPort === null) {
      errors.push('NaviPort location not selected')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  return {
    validateCustomizations,
    validateCart,
  }
}