import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', () => {
  const access_token = ref('')
  const refresh_token = ref('')

  return { access_token, refresh_token }
})

/*
user -> frontend
frontend -> request to backend (logged in ?)
if yes they are a user grab tokens

if not we assume guest account?
yes -> request to backend (backend creates "tmp_acct")
gives tokens?



temp account has some sort of default username and password?
*/
