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
      country: 'United States of America',
      postcode: '',
    }),
  },
)
</script>

<template>
  <div v-if="props.address">
    <div class="flex flex-col items-start gap-1">
      <p v-if="props.address.house_number || props.address.road">
        {{ props.address.house_number }} {{ props.address.road }}
      </p>
      <div class="flex flex-row gap-1">
        <p
          v-if="props.address.city || props.address.state || props.address.postcode"
          class="address-city"
        >
          {{ props.address.city }}<span v-if="props.address.city && props.address.state">, </span>
        </p>
        <p>{{ props.address.state }} {{ props.address.postcode }}</p>
      </div>
      <p v-if="props.address.country">
        {{ props.address.country }}
      </p>
    </div>
  </div>
</template>
