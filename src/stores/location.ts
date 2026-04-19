import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useGeolocation } from '@vueuse/core'

export type Homebase = {
  address: string
  latitude: number
  longitude: number
}

export type LocationMode = 'device' | 'homebase'

const HOMEBASE_KEY = 'navi:homebase'
const MODE_KEY = 'navi:locationMode'

const loadHomebase = (): Homebase | null => {
  try {
    const raw = localStorage.getItem(HOMEBASE_KEY)
    return raw ? (JSON.parse(raw) as Homebase) : null
  } catch {
    return null
  }
}

const loadMode = (): LocationMode => {
  const raw = localStorage.getItem(MODE_KEY)
  return raw === 'homebase' ? 'homebase' : 'device'
}

export const useLocationStore = defineStore('location', () => {
  const { coords, locatedAt, error, resume, pause } = useGeolocation()

  const homebase = ref<Homebase | null>(loadHomebase())
  const mode = ref<LocationMode>(loadMode())
  const geocodeError = ref<string | null>(null)
  const isGeocoding = ref(false)

  watch(homebase, (v) => {
    if (v) localStorage.setItem(HOMEBASE_KEY, JSON.stringify(v))
    else localStorage.removeItem(HOMEBASE_KEY)
  })

  watch(mode, (v) => {
    localStorage.setItem(MODE_KEY, v)
  })

  const activeCoords = computed<{ latitude: number; longitude: number } | null>(() => {
    if (mode.value === 'homebase') {
      if (!homebase.value) return null
      return { latitude: homebase.value.latitude, longitude: homebase.value.longitude }
    }
    if (!locatedAt.value) return null
    return { latitude: coords.value.latitude, longitude: coords.value.longitude }
  })

  const setMode = (m: LocationMode) => {
    mode.value = m
    if (m === 'device') resume()
  }

  const setHomebase = async (address: string) => {
    const trimmed = address.trim()
    if (!trimmed) {
      geocodeError.value = 'address is required'
      return
    }
    geocodeError.value = null
    isGeocoding.value = true
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('geocoding service unavailable')
      const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>
      if (!data || data.length === 0) throw new Error('no results for that address')
      const hit = data[0]!
      homebase.value = {
        address: hit.display_name,
        latitude: parseFloat(hit.lat),
        longitude: parseFloat(hit.lon),
      }
      mode.value = 'homebase'
    } catch (e: unknown) {
      geocodeError.value = e instanceof Error ? e.message : 'lookup failed'
    } finally {
      isGeocoding.value = false
    }
  }

  const clearHomebase = () => {
    homebase.value = null
    if (mode.value === 'homebase') mode.value = 'device'
  }

  return {
    coords,
    locatedAt,
    error,
    resume,
    pause,
    homebase,
    mode,
    geocodeError,
    isGeocoding,
    activeCoords,
    setMode,
    setHomebase,
    clearHomebase,
  }
})
