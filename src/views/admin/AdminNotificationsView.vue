<script setup lang="ts">
import { ref } from 'vue'
import NaviButton from '@/components/shared/NaviButton.vue'
import {
  useEmailLogs,
  useTextLogs,
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
} from '@/composables/useNotificationsAdmin'
import type { EmailTemplate } from '@/types/notifications'

type Tab = 'templates' | 'email' | 'sms'
const tab = ref<Tab>('templates')

const { data: templates, isPending: templatesLoading } = useEmailTemplates()
const { data: emailLogs, isPending: emailLoading } = useEmailLogs()
const { data: textLogs, isPending: textLoading } = useTextLogs()

const { mutate: createTemplate, isPending: creating } = useCreateEmailTemplate()
const { mutate: updateTemplate, isPending: updating } = useUpdateEmailTemplate()
const { mutate: deleteTemplate } = useDeleteEmailTemplate()

// null id = creating a new template, otherwise editing an existing one.
const editingId = ref<string | null>(null)
const form = ref({ subject: '', body: '', link: '' })

const resetForm = () => {
  editingId.value = null
  form.value = { subject: '', body: '', link: '' }
}

const startEdit = (t: EmailTemplate) => {
  editingId.value = t.id
  form.value = { subject: t.subject, body: t.body, link: t.link }
}

const submit = () => {
  if (!form.value.subject.trim()) return
  if (editingId.value) {
    updateTemplate({ id: editingId.value, ...form.value }, { onSuccess: resetForm })
  } else {
    createTemplate({ ...form.value }, { onSuccess: resetForm })
  }
}

const remove = (t: EmailTemplate) => {
  if (editingId.value === t.id) resetForm()
  deleteTemplate(t.id)
}

const sentLabel = (isSent: boolean | null) =>
  isSent === null ? 'SKIPPED' : isSent ? 'SENT' : 'FAILED'

const sentClass = (isSent: boolean | null) =>
  isSent === null ? 'font-secondary' : isSent ? 'text-green' : 'text-red'

const formatDate = (iso: string) => new Date(iso).toLocaleString()

const tabs: { id: Tab; label: string }[] = [
  { id: 'templates', label: 'TEMPLATES' },
  { id: 'email', label: 'EMAIL LOGS' },
  { id: 'sms', label: 'SMS LOGS' },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-3 py-4 font-mono">
    <h1 class="text-xl tracking-wide mb-1">
      <span class="text-green">▪</span> ADMIN · NOTIFICATIONS
    </h1>
    <p class="font-secondary text-sm mb-6">manage templates and audit delivery logs</p>

    <!-- Tabs -->
    <div class="flex border border-alt mb-6 w-fit">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="px-3 py-1 border-r border-alt last:border-r-0 cursor-pointer transition-colors"
        :class="tab === t.id ? 'bg-green text-primary' : 'hover:bg-green hover:text-primary'"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Templates -->
    <section v-if="tab === 'templates'" class="flex flex-col gap-6">
      <div class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt tracking-wide">
          // {{ editingId ? 'EDIT TEMPLATE' : 'NEW TEMPLATE' }}
        </h2>
        <div class="p-3 flex flex-col gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-sm">subject</span>
            <input v-model="form.subject" class="border border-alt bg-transparent px-2 py-1" />
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-sm">body</span>
            <textarea
              v-model="form.body"
              rows="4"
              class="border border-alt bg-transparent px-2 py-1 font-mono"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-sm">link</span>
            <input v-model="form.link" class="border border-alt bg-transparent px-2 py-1" />
          </label>
          <div class="flex gap-2">
            <NaviButton variant="filled" :disabled="creating || updating" @click="submit">
              {{ editingId ? 'SAVE' : 'CREATE' }}
            </NaviButton>
            <NaviButton v-if="editingId" @click="resetForm">CANCEL</NaviButton>
          </div>
        </div>
      </div>

      <div class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt tracking-wide">// TEMPLATES</h2>
        <p v-if="templatesLoading" class="p-3 font-secondary">loading...</p>
        <p v-else-if="!templates?.length" class="p-3 font-secondary">no templates yet.</p>
        <ul v-else class="divide-y divide-alt">
          <li
            v-for="t in templates"
            :key="t.id"
            class="p-3 flex items-center justify-between gap-4"
          >
            <div class="min-w-0">
              <div class="truncate">{{ t.subject }}</div>
              <div class="font-secondary text-xs truncate">{{ t.link }}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <NaviButton @click="startEdit(t)">EDIT</NaviButton>
              <NaviButton @click="remove(t)">DEL</NaviButton>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Email logs -->
    <section v-else-if="tab === 'email'" class="border border-alt overflow-x-auto">
      <h2 class="px-3 py-2 border-b border-alt tracking-wide">// EMAIL LOGS</h2>
      <p v-if="emailLoading" class="p-3 font-secondary">loading...</p>
      <p v-else-if="!emailLogs?.length" class="p-3 font-secondary">no email logs.</p>
      <table v-else class="w-full text-sm">
        <thead class="font-secondary text-left border-b border-alt">
          <tr>
            <th class="px-3 py-2">recipient</th>
            <th class="px-3 py-2">reason</th>
            <th class="px-3 py-2">status</th>
            <th class="px-3 py-2">sent</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in emailLogs" :key="log.id" class="border-b border-alt/40">
            <td class="px-3 py-2 truncate">{{ log.recipient }}</td>
            <td class="px-3 py-2">{{ log.reason }}</td>
            <td class="px-3 py-2" :class="sentClass(log.is_sent)">{{ sentLabel(log.is_sent) }}</td>
            <td class="px-3 py-2 font-secondary">{{ formatDate(log.sent_at) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- SMS logs -->
    <section v-else class="border border-alt overflow-x-auto">
      <h2 class="px-3 py-2 border-b border-alt tracking-wide">// SMS LOGS</h2>
      <p v-if="textLoading" class="p-3 font-secondary">loading...</p>
      <p v-else-if="!textLogs?.length" class="p-3 font-secondary">no sms logs.</p>
      <table v-else class="w-full text-sm">
        <thead class="font-secondary text-left border-b border-alt">
          <tr>
            <th class="px-3 py-2">recipient</th>
            <th class="px-3 py-2">reason</th>
            <th class="px-3 py-2">status</th>
            <th class="px-3 py-2">sent</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in textLogs" :key="log.id" class="border-b border-alt/40">
            <td class="px-3 py-2">{{ log.recipient }}</td>
            <td class="px-3 py-2">{{ log.reason }}</td>
            <td class="px-3 py-2" :class="sentClass(log.is_sent)">{{ sentLabel(log.is_sent) }}</td>
            <td class="px-3 py-2 font-secondary">{{ formatDate(log.sent_at) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
