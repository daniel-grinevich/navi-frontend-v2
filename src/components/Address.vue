<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/
export type Address = {
  house_number?: string
  road?: string
  city?: string
  state?: string
  country?: string
  postcode?: string
}

const props = withDefaults(
  defineProps<{
    address?: Address
  }>(),
  {
    address: () => ({
      house_number: '',
      road: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
    }),
  },
)
</script>
<template>
  <div v-if="props.address" class="text-sm text-gray-700">
    <p v-if="props.address.house_number || props.address.road">
      {{ props.address.house_number }} {{ props.address.road }}
    </p>
    <p v-if="props.address.city || props.address.state || props.address.postcode">
      {{ props.address.city }}<span v-if="props.address.city && props.address.state">, </span
      >{{ props.address.state }} {{ props.address.postcode }}
    </p>
    <p v-if="props.address.country">{{ props.address.country }}</p>
  </div>
</template>
