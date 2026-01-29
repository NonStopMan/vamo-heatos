<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { enqueueLead, flushQueue, getQueueSize } from '../stores/offlineQueue'

type PictureGroup = {
  outdoorUnitLocation?: { url: string }[]
}

type LeadPayload = {
  version: '1.2.0'
  contact: {
    contactInformation: {
      firstName: string
      lastName: string
      phone: string
      mobile?: string
      email: string
    }
    address: {
      street?: string
      city?: string
      postalCode?: string
      countryCode?: string
    }
  }
  project?: {
    pictures?: PictureGroup
  }
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const form = reactive<LeadPayload>({
  version: '1.2.0',
  contact: {
    contactInformation: {
      firstName: '',
      lastName: '',
      phone: '',
      mobile: '',
      email: '',
    },
    address: {
      street: '',
      city: '',
      postalCode: '',
      countryCode: '',
    },
  },
  project: {
    pictures: {
      outdoorUnitLocation: [],
    },
  },
})

const selectedFiles = ref<File[]>([])
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const queueSize = ref(getQueueSize())

const countryOptions = [
  'Germany',
  'Austria',
  'Switzerland',
  'Netherlands',
  'Belgium',
  'France',
  'Italy',
  'Spain',
  'United Kingdom',
  'United States',
  'Other',
]

const hasErrors = computed(() => Object.keys(errors).length > 0)

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!form.contact.contactInformation.firstName.trim()) {
    errors.firstName = 'First name is required'
  }
  if (!form.contact.contactInformation.lastName.trim()) {
    errors.lastName = 'Last name is required'
  }
  if (!form.contact.contactInformation.phone.trim()) {
    errors.phone = 'Phone is required'
  }
  if (!form.contact.contactInformation.email.trim()) {
    errors.email = 'Email is required'
  }
  return !hasErrors.value
}

const resetMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const uploadPictures = async (): Promise<string[]> => {
  if (!selectedFiles.value.length) return []

  const formData = new FormData()
  selectedFiles.value.forEach((file) => formData.append('files', file))

  const response = await fetch(`${apiUrl}/leads/uploads`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload pictures')
  }

  const payload = (await response.json()) as { urls?: string[] }
  return payload.urls ?? []
}

const submitPayload = async (payload: LeadPayload): Promise<boolean> => {
  const response = await fetch(`${apiUrl}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const payloadBody = await response.json().catch(() => null)
    errorMessage.value = payloadBody?.reason ?? 'Failed to submit lead'
    return false
  }
  return true
}

const submit = async () => {
  resetMessages()
  if (!validate()) {
    return
  }

  submitting.value = true
  try {
    if (!navigator.onLine) {
      enqueueLead(form)
      queueSize.value = getQueueSize()
      successMessage.value = 'Saved offline. Will submit when online.'
      return
    }

    const urls = await uploadPictures()
    if (urls.length) {
      const normalized = urls.map((url) =>
        url.startsWith('http') ? url : `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`,
      )
      form.project = form.project ?? {}
      form.project.pictures = {
        outdoorUnitLocation: normalized.map((url) => ({ url })),
      }
    }

    const ok = await submitPayload(form)
    if (ok) {
      successMessage.value = 'Lead submitted successfully.'
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit lead'
  } finally {
    submitting.value = false
  }
}

const flush = async () => {
  if (!navigator.onLine) return
  const remaining = await flushQueue(async (payload) => submitPayload(payload as LeadPayload))
  queueSize.value = remaining
}

const onFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFiles.value = Array.from(target.files ?? [])
}

onMounted(() => {
  window.addEventListener('online', flush)
  flush()
})

onUnmounted(() => {
  window.removeEventListener('online', flush)
})
</script>

<template>
  <main class="lead-form">
    <h1>Lead Intake</h1>
    <p class="lead-form__subtitle">Submit a new lead to the HeatOS sales funnel.</p>
    <p v-if="queueSize" class="lead-form__queue">Queued offline leads: {{ queueSize }}</p>

    <form @submit.prevent="submit">
      <section>
        <h2>Contact Information</h2>
        <div class="field">
          <label for="firstName">First name</label>
          <input id="firstName" v-model="form.contact.contactInformation.firstName" type="text" />
          <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
        </div>
        <div class="field">
          <label for="lastName">Last name</label>
          <input id="lastName" v-model="form.contact.contactInformation.lastName" type="text" />
          <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
        </div>
        <div class="field">
          <label for="phone">Phone</label>
          <input id="phone" v-model="form.contact.contactInformation.phone" type="tel" />
          <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        </div>
        <div class="field">
          <label for="mobile">Mobile</label>
          <input id="mobile" v-model="form.contact.contactInformation.mobile" type="tel" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="form.contact.contactInformation.email" type="email" />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
      </section>

      <section>
        <h2>Address (optional)</h2>
        <div class="field">
          <label for="street">Street</label>
          <input id="street" v-model="form.contact.address.street" type="text" />
        </div>
        <div class="field">
          <label for="city">City</label>
          <input id="city" v-model="form.contact.address.city" type="text" />
        </div>
        <div class="field">
          <label for="postalCode">Postal code</label>
          <input id="postalCode" v-model="form.contact.address.postalCode" type="text" />
        </div>
        <div class="field">
          <label for="countryCode">Country</label>
          <select id="countryCode" v-model="form.contact.address.countryCode">
            <option value="">Select a country</option>
            <option v-for="country in countryOptions" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>
      </section>

      <section>
        <h2>Outdoor Unit Photos (optional)</h2>
        <div class="field">
          <label for="photos">Upload pictures</label>
          <input id="photos" type="file" multiple accept="image/*" @change="onFilesSelected" />
        </div>
      </section>

      <div class="actions">
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Submit lead' }}
        </button>
      </div>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </main>
</template>

<style scoped>
:global(body) {
  font-family: 'Space Grotesk', 'IBM Plex Sans', 'Segoe UI', sans-serif;
  background: radial-gradient(1200px circle at 10% 10%, #f5f1ff 0%, #fdf7ef 45%, #f7fbff 100%);
  color: #1f2937;
  margin: 0;
}

.lead-form {
  --ink: #1f2937;
  --muted: #6b7280;
  --accent: #0f766e;
  --card: rgba(255, 255, 255, 0.88);
  --shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  max-width: 680px;
  margin: 0 auto;
  padding: 3rem 1.5rem 3.5rem;
}

.lead-form h1 {
  font-size: clamp(2rem, 2.6vw, 2.6rem);
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
}

.lead-form__subtitle {
  color: var(--muted);
  margin-bottom: 1.75rem;
}

.lead-form__queue {
  background: linear-gradient(120deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.12));
  border: 1px solid rgba(15, 118, 110, 0.2);
  border-radius: 999px;
  display: inline-flex;
  padding: 0.35rem 0.9rem;
  font-size: 0.9rem;
  color: var(--ink);
}

form {
  background: var(--card);
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 2rem;
  backdrop-filter: blur(6px);
  animation: rise 500ms ease-out;
}

section {
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed rgba(15, 118, 110, 0.18);
}

section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

h2 {
  font-size: 1.1rem;
  margin: 0 0 1rem;
  color: var(--ink);
}

.field {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--ink);
}

input,
select {
  border: 1px solid rgba(15, 118, 110, 0.2);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.18);
  transform: translateY(-1px);
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

button {
  border: none;
  background: linear-gradient(120deg, var(--accent), #0ea5a5);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 14px 20px rgba(15, 118, 110, 0.25);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    opacity 150ms ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 24px rgba(15, 118, 110, 0.28);
}

.error {
  color: #b91c1c;
  font-size: 0.85rem;
}

.success {
  color: #166534;
  font-weight: 600;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  form {
    padding: 1.5rem;
  }
  .actions {
    justify-content: stretch;
  }
  button {
    width: 100%;
  }
}
</style>
