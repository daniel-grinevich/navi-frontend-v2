import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import { useQueryClient } from '@tanstack/vue-query'
import type {
  EmailLog,
  EmailTemplate,
  EmailTemplateInput,
  TextLog,
} from '@/types/notifications'

const TEMPLATES_KEY = ['email-templates']

export const useEmailLogs = () =>
  useApi<EmailLog[]>(['email-logs'], () =>
    apiClient<EmailLog[]>('api/email_logs/', { method: 'GET' }),
  )

export const useTextLogs = () =>
  useApi<TextLog[]>(['text-logs'], () =>
    apiClient<TextLog[]>('api/text_logs/', { method: 'GET' }),
  )

export const useEmailTemplates = () =>
  useApi<EmailTemplate[]>(TEMPLATES_KEY, () =>
    apiClient<EmailTemplate[]>('api/email_templates/', { method: 'GET' }),
  )

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient()

  return useApiWrite<EmailTemplate, Error, EmailTemplateInput>(
    (body) =>
      apiClient<EmailTemplate>('api/email_templates/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY }) },
  )
}

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient()

  return useApiWrite<EmailTemplate, Error, EmailTemplateInput & { id: string }>(
    ({ id, ...body }) =>
      apiClient<EmailTemplate>(`api/email_templates/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY }) },
  )
}

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient()

  return useApiWrite<{ success: boolean }, Error, string>(
    (id) => apiClient(`api/email_templates/${id}/`, { method: 'DELETE' }),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY }) },
  )
}
