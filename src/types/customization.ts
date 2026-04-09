// "customization_groups": [
//             {
//                 "name": "Customization Group 006",
//                 "category": [
//                     33
//                 ],
//                 "description": "Guy page fund chair.",
//                 "display_order": 6,
//                 "is_required": false,
//                 "created_at": "2025-12-16T03:27:35.255304Z",
//                 "created_by": 1130,
//                 "updated_at": "2025-12-16T03:27:35.257119Z",
//                 "updated_by": 1131,
//                 "slug": "123-555-0006",
//                 "customizations": [
//                     {
//                         "name": "Customization 038",
//                         "group": 52,
//                         "description": "Born word speak.",
//                         "display_order": 2,
//                         "price": "89.24",
//                         "created_at": "2025-12-16T03:27:35.329682Z",
//                         "created_by": 1132,
//                         "updated_at": "2025-12-16T03:27:35.329688Z",
//                         "updated_by": 1133,
//                         "slug": "123-555-0038"
//                     },
//                     {
//                         "name": "Customization 039",
//                         "group": 52,
//                         "description": "Bed walk together thousand.",
//                         "display_order": 7,
//                         "price": "47.31",
//                         "created_at": "2025-12-16T03:27:35.407323Z",
//                         "created_by": 1134,
//                         "updated_at": "2025-12-16T03:27:35.407331Z",
//                         "updated_by": 1135,
//                         "slug": "123-555-0039"
//                     },
//                     {
//                         "name": "Customization 040",
//                         "group": 52,
//                         "description": "Mention serious soon bar wear current item.",
//                         "display_order": 7,
//                         "price": "95.10",
//                         "created_at": "2025-12-16T03:27:35.489826Z",
//                         "created_by": 1136,
//                         "updated_at": "2025-12-16T03:27:35.489832Z",
//                         "updated_by": 1137,
//                         "slug": "123-555-0040"
//                     }
//                 ]
//             },
export type CustomizationOption = {
  id: string
  name: string
  price: number
  is_available: boolean
  display_order?: number
}

export type CustomizationGroup = {
  id: string
  slug: string
  name: string
  description?: string
  display_order: number
  is_required: boolean
  allow_multiple: boolean
  min_allowed: number
  max_allowed: number
  customizations: CustomizationOption[]
}

export type SelectedCustomization = {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceModifier: number
}

export type Category = {
  id: string 
  name: string
  customization_groups: CustomizationGroup[]
}

export type MenuItemCategory = {
  id: string
  slug: string
  name: string
  status: string
  category: Category
  body: string
  description: string
  price: string
}
