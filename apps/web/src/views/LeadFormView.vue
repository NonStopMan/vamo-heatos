<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { enqueueLead, flushQueue, getQueueSize } from '../stores/offlineQueue'
import { deleteOfflinePhotos, getOfflinePhotos, saveOfflinePhotos } from '../stores/offlinePhotos'

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
  building: {
    buildingInformation: {
      residentialUnits?: number | ''
      boilerRoomSize?: string
      installationLocationCeilingHeight?: string
      widthPathway?: string
      heightPathway?: string
    }
    energyRelevantInformation: {
      typeOfHeating?: string
      locationHeating?: string
    }
  }
  heatingSystem: {
    consumption?: number | ''
    consumptionUnit?: string
    systemType?: string
  }
  project: {
    timeline?: string
    fullReplacementOfHeatingSystemPlanned?: boolean | ''
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
  building: {
    buildingInformation: {
      residentialUnits: '',
      boilerRoomSize: '',
      installationLocationCeilingHeight: '',
      widthPathway: '',
      heightPathway: '',
    },
    energyRelevantInformation: {
      typeOfHeating: '',
      locationHeating: '',
    },
  },
  heatingSystem: {
    consumption: '',
    consumptionUnit: '',
    systemType: '',
  },
  project: {
    timeline: '',
    fullReplacementOfHeatingSystemPlanned: '',
    pictures: {
      outdoorUnitLocation: [],
    },
  },
})

const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)
const queueSize = ref(getQueueSize())

type Toast = {
  id: string
  type: 'success' | 'error'
  message: string
}

const toasts = ref<Toast[]>([])

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

const boilerRoomSizeOptions = ['weniger als 4qm', 'mehr als 4 qm']
const ceilingHeightOptions = ['niedriger als 180 cm', '180 - 199 cm', 'höher als 199 cm']
const yesNoOptions = ['Ja', 'Nein']
const heatingTypeOptions = [
  'Heizkörper',
  'Fußbodenheizung',
  'Heizkörper + Fußbodenheizung',
  'Nachtspeicherofen',
  'Sonstiges',
]
const heatingLocationOptions = [
  'Unterm Dach',
  'Im Keller',
  'Im EG',
  '1.OG',
  'Dachgeschoss',
  'Obergeschoss',
  'Keller',
  'Erdgeschoss',
]
const consumptionUnitOptions = ['Liter (l)', 'Kilowattstunden (kWh)']
const systemTypeOptions = [
  'Fernwärme',
  'Gasetagenheizung',
  'Kohle',
  'Heizöl',
  'Wärmepumpe',
  'Erdgas',
  'Flüssiggas',
  'Pellet-/Holzheizung',
  'Sonstiges',
]
const timelineOptions = ['Sofort', '1-3 Monate', '3-6 Monate', '>6 Monate']
const yesNoBooleanOptions = [
  { label: 'Ja', value: true },
  { label: 'Nein', value: false },
]

const hasErrors = computed(() => Object.keys(errors).length > 0)
const steps = ['Contact', 'Address', 'Discovery', 'Photos']
const currentStep = ref(0)
const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep = computed(() => currentStep.value === steps.length - 1)

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const clearErrors = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
}

const validateContact = () => {
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
  } else if (!isValidEmail(form.contact.contactInformation.email)) {
    errors.email = 'Email must be valid'
  }
  return !hasErrors.value
}

const validateDiscovery = () => {
  if (
    form.building?.buildingInformation?.residentialUnits !== '' &&
    (typeof form.building?.buildingInformation?.residentialUnits !== 'number' ||
      Number.isNaN(form.building?.buildingInformation?.residentialUnits) ||
      form.building?.buildingInformation?.residentialUnits < 0)
  ) {
    errors.residentialUnits = 'Residential units must be 0 or more'
  }
  if (
    form.heatingSystem?.consumption !== '' &&
    (typeof form.heatingSystem?.consumption !== 'number' ||
      Number.isNaN(form.heatingSystem?.consumption) ||
      form.heatingSystem?.consumption < 0)
  ) {
    errors.consumption = 'Consumption must be 0 or more'
  }
  return !hasErrors.value
}

const validateAll = () => {
  clearErrors()
  const contactValid = validateContact()
  const discoveryValid = validateDiscovery()
  return contactValid && discoveryValid
}

const clearToasts = () => {
  toasts.value = []
}

const addToast = (type: Toast['type'], message: string) => {
  const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
  toasts.value.push({ id, type, message })
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, 4500)
}

const resetForm = () => {
  form.contact.contactInformation.firstName = ''
  form.contact.contactInformation.lastName = ''
  form.contact.contactInformation.phone = ''
  form.contact.contactInformation.mobile = ''
  form.contact.contactInformation.email = ''
  form.contact.address.street = ''
  form.contact.address.city = ''
  form.contact.address.postalCode = ''
  form.contact.address.countryCode = ''
  form.building = {
    buildingInformation: {
      residentialUnits: '',
      boilerRoomSize: '',
      installationLocationCeilingHeight: '',
      widthPathway: '',
      heightPathway: '',
    },
    energyRelevantInformation: {
      typeOfHeating: '',
      locationHeating: '',
    },
  }
  form.heatingSystem = {
    consumption: '',
    consumptionUnit: '',
    systemType: '',
  }
  form.project = { pictures: { outdoorUnitLocation: [] } }
  form.project.timeline = ''
  form.project.fullReplacementOfHeatingSystemPlanned = ''
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  Object.keys(errors).forEach((key) => delete errors[key])
  currentStep.value = 0
}

const sanitizePayload = (value: unknown): unknown => {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  }
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => sanitizePayload(item)).filter((item) => item !== undefined)
    return cleaned.length ? cleaned : undefined
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => [key, sanitizePayload(val)] as const)
      .filter(([, val]) => val !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return value
}

const stripExternalId = (payload: Record<string, unknown>) => {
  if ('id' in payload) {
    delete payload.id
  }
  return payload
}

const buildPayload = (): LeadPayload => {
  const cleaned = sanitizePayload(form) as Record<string, unknown> | undefined
  if (!cleaned) return form
  return stripExternalId(cleaned) as LeadPayload
}

const uploadPictures = async (files: File[]): Promise<string[]> => {
  if (!files.length) return []

  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

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
    addToast('error', payloadBody?.reason ?? 'Failed to submit lead')
    return false
  }
  return true
}

const submit = async () => {
  clearToasts()
  if (!validateAll()) {
    if (errors.firstName || errors.lastName || errors.phone || errors.email) {
      currentStep.value = 0
    } else if (errors.residentialUnits || errors.consumption) {
      currentStep.value = 2
    }
    return
  }

  submitting.value = true
  try {
    const payload = buildPayload()
    if (!navigator.onLine) {
      const photoKeys = await saveOfflinePhotos(selectedFiles.value)
      enqueueLead(payload, { photoKeys })
      queueSize.value = getQueueSize()
      addToast('success', 'Saved offline. Will submit when online.')
      resetForm()
      return
    }

    const urls = await uploadPictures(selectedFiles.value)
    if (urls.length) {
      const normalized = urls.map((url) =>
        url.startsWith('http') ? url : `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`,
      )
      payload.project = payload.project ?? {}
      payload.project.pictures = {
        outdoorUnitLocation: normalized.map((url) => ({ url })),
      }
    }

    const ok = await submitPayload(payload)
    if (ok) {
      addToast('success', 'Lead submitted successfully.')
      resetForm()
    }
  } catch (error) {
    addToast('error', error instanceof Error ? error.message : 'Failed to submit lead')
  } finally {
    submitting.value = false
  }
}

const goNext = () => {
  clearErrors()
  if (currentStep.value === 0 && !validateContact()) return
  if (currentStep.value === 2 && !validateDiscovery()) return
  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1
  }
}

const goBack = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

const handleSubmit = () => {
  if (isLastStep.value) {
    submit()
    return
  }
  goNext()
}

const flush = async () => {
  if (!navigator.onLine) return
  const remaining = await flushQueue(async (payload, attachments) => {
    try {
      if (attachments?.photoKeys?.length) {
        const files = await getOfflinePhotos(attachments.photoKeys)
        if (files.length) {
          const urls = await uploadPictures(files)
          if (urls.length) {
            const normalized = urls.map((url) =>
              url.startsWith('http') ? url : `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`,
            )
            const leadPayload = stripExternalId(
              sanitizePayload(payload) as Record<string, unknown>,
            ) as LeadPayload
            leadPayload.project = leadPayload.project ?? {}
            leadPayload.project.pictures = {
              outdoorUnitLocation: normalized.map((url) => ({ url })),
            }
            payload = leadPayload as Record<string, unknown>
          }
        }
      }

      const cleaned = stripExternalId(
        sanitizePayload(payload) as Record<string, unknown>,
      ) as LeadPayload
      const ok = await submitPayload(cleaned)
      if (ok && attachments?.photoKeys?.length) {
        await deleteOfflinePhotos(attachments.photoKeys)
      }
      return ok
    } catch (error) {
      return false
    }
  })
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

    <form @submit.prevent="handleSubmit">
      <ol class="stepper" role="list">
        <li v-for="(step, index) in steps" :key="step" class="stepper__item">
          <span
            class="stepper__dot"
            :class="{ 'is-active': index === currentStep, 'is-complete': index < currentStep }"
          ></span>
          <span class="stepper__label">{{ step }}</span>
        </li>
      </ol>

      <section v-if="currentStep === 0">
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

      <section v-if="currentStep === 1">
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

      <section v-if="currentStep === 2">
        <h2>Discovery Details (recommended)</h2>
        <div class="field">
          <label for="residentialUnits">Residential units</label>
          <input
            id="residentialUnits"
            v-model.number="form.building.buildingInformation.residentialUnits"
            type="number"
            min="0"
          />
          <span v-if="errors.residentialUnits" class="error">{{ errors.residentialUnits }}</span>
        </div>
        <div class="field">
          <label for="boilerRoomSize">Boiler room size</label>
          <select id="boilerRoomSize" v-model="form.building.buildingInformation.boilerRoomSize">
            <option value="">Select a size</option>
            <option v-for="option in boilerRoomSizeOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="installationLocationCeilingHeight">Installation ceiling height</label>
          <select
            id="installationLocationCeilingHeight"
            v-model="form.building.buildingInformation.installationLocationCeilingHeight"
          >
            <option value="">Select a height</option>
            <option v-for="option in ceilingHeightOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="widthPathway">Pathway width available</label>
          <select id="widthPathway" v-model="form.building.buildingInformation.widthPathway">
            <option value="">Select</option>
            <option v-for="option in yesNoOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="heightPathway">Pathway height available</label>
          <select id="heightPathway" v-model="form.building.buildingInformation.heightPathway">
            <option value="">Select</option>
            <option v-for="option in yesNoOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="typeOfHeating">Type of heating</label>
          <select
            id="typeOfHeating"
            v-model="form.building.energyRelevantInformation.typeOfHeating"
          >
            <option value="">Select a type</option>
            <option v-for="option in heatingTypeOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="locationHeating">Heating location</label>
          <select
            id="locationHeating"
            v-model="form.building.energyRelevantInformation.locationHeating"
          >
            <option value="">Select a location</option>
            <option v-for="option in heatingLocationOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="consumption">Heating consumption</label>
          <input
            id="consumption"
            v-model.number="form.heatingSystem.consumption"
            type="number"
            min="0"
          />
          <span v-if="errors.consumption" class="error">{{ errors.consumption }}</span>
        </div>
        <div class="field">
          <label for="consumptionUnit">Consumption unit</label>
          <select id="consumptionUnit" v-model="form.heatingSystem.consumptionUnit">
            <option value="">Select a unit</option>
            <option v-for="option in consumptionUnitOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="systemType">Heating system type</label>
          <select id="systemType" v-model="form.heatingSystem.systemType">
            <option value="">Select a system</option>
            <option v-for="option in systemTypeOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="timeline">Project timeline</label>
          <select id="timeline" v-model="form.project.timeline">
            <option value="">Select a timeline</option>
            <option v-for="option in timelineOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="fullReplacementOfHeatingSystemPlanned"
            >Full heating system replacement planned</label
          >
          <select
            id="fullReplacementOfHeatingSystemPlanned"
            v-model="form.project.fullReplacementOfHeatingSystemPlanned"
          >
            <option value="">Select</option>
            <option v-for="option in yesNoBooleanOptions" :key="option.label" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </section>

      <section v-if="currentStep === 3">
        <h2>Outdoor Unit Photos (optional)</h2>
        <div class="field">
          <label for="photos">Upload pictures</label>
          <input
            id="photos"
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="onFilesSelected"
          />
        </div>
      </section>

      <div class="actions">
        <button
          type="button"
          class="button--ghost"
          :disabled="isFirstStep"
          data-testid="back-step"
          @click="goBack"
        >
          Back
        </button>
        <button v-if="!isLastStep" type="submit" :disabled="submitting" data-testid="next-step">
          Next
        </button>
        <button v-else type="submit" :disabled="submitting" data-testid="submit-lead">
          {{ submitting ? 'Submitting…' : 'Submit lead' }}
        </button>
      </div>
    </form>

    <div class="toaster" role="status" aria-live="polite">
      <TransitionGroup name="toast" tag="div">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          <span>{{ toast.message }}</span>
          <button
            class="toast__close"
            type="button"
            @click="toasts = toasts.filter((t) => t.id !== toast.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
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

.stepper {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  padding: 0;
  margin: 0 0 1.5rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.stepper__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.stepper__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 2px solid rgba(15, 118, 110, 0.25);
  background: transparent;
}

.stepper__dot.is-active {
  background: var(--accent);
  border-color: var(--accent);
}

.stepper__dot.is-complete {
  background: rgba(15, 118, 110, 0.2);
  border-color: rgba(15, 118, 110, 0.4);
}

.stepper__label {
  font-weight: 600;
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
  justify-content: space-between;
  gap: 0.75rem;
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

button.button--ghost {
  background: transparent;
  border: 1px solid rgba(15, 118, 110, 0.2);
  color: var(--accent);
  box-shadow: none;
}

button.button--ghost:hover {
  transform: translateY(-1px);
  box-shadow: none;
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

.toaster {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 20;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 220px;
  max-width: 320px;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(15, 118, 110, 0.2);
  color: var(--ink);
}

.toast.success {
  border-color: rgba(22, 101, 52, 0.3);
  background: linear-gradient(120deg, #ecfdf3, #f0fdf4);
}

.toast.error {
  border-color: rgba(185, 28, 28, 0.3);
  background: linear-gradient(120deg, #fef2f2, #fff5f5);
}

.toast__close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.1rem;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 200ms ease,
    opacity 200ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
    flex-direction: column;
  }
  button {
    width: 100%;
  }
  .toaster {
    left: 1rem;
    right: 1rem;
    top: 1rem;
  }
  .toast {
    max-width: none;
  }
}
</style>
