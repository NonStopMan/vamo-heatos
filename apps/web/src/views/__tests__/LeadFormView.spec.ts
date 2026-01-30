import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import LeadFormView from '../LeadFormView.vue'

describe('LeadFormView', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  const nextTick = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.vm.$nextTick()
  }

  const submitStep = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick(wrapper)
  }

  const fillRequired = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.find('#firstName').setValue('Ada')
    await wrapper.find('#lastName').setValue('Lovelace')
    await wrapper.find('#phone').setValue('+49 123 456')
    await wrapper.find('#email').setValue('ada@example.com')
  }

  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

  beforeEach(() => {
    fetchSpy = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchSpy as unknown as typeof fetch)
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows validation errors when required fields are missing', async () => {
    const wrapper = mount(LeadFormView)

    await submitStep(wrapper)

    expect(wrapper.text()).toContain('First name is required')
    expect(wrapper.text()).toContain('Last name is required')
    expect(wrapper.text()).toContain('Phone is required')
    expect(wrapper.text()).toContain('Email is required')
  })

  it('shows success toast and resets fields after submit', async () => {
    const wrapper = mount(LeadFormView)

    await fillRequired(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await flushPromises()

    expect(wrapper.text()).toContain('Lead submitted successfully.')
    expect((wrapper.find('#firstName').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#lastName').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#phone').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#email').element as HTMLInputElement).value).toBe('')
  })

  it('shows error toast when API fails', async () => {
    const wrapper = mount(LeadFormView)
    fetchSpy = vi.fn(async () => ({ ok: false, json: async () => ({ reason: 'Bad request' }) }))
    vi.stubGlobal('fetch', fetchSpy as unknown as typeof fetch)

    await fillRequired(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await flushPromises()

    expect(wrapper.text()).toContain('Bad request')
  })

  it('blocks invalid email format on the first step', async () => {
    const wrapper = mount(LeadFormView)

    await wrapper.find('#firstName').setValue('Ada')
    await wrapper.find('#lastName').setValue('Lovelace')
    await wrapper.find('#phone').setValue('+49 123 456')
    await wrapper.find('#email').setValue('invalid-email')
    await submitStep(wrapper)

    expect(wrapper.text()).toContain('Email must be valid')
  })

  it('blocks negative discovery numbers on the discovery step', async () => {
    const wrapper = mount(LeadFormView)

    await fillRequired(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await wrapper.find('#residentialUnits').setValue('-1')
    await submitStep(wrapper)

    expect(wrapper.text()).toContain('Residential units must be 0 or more')
  })

  it('submits discovery fields in payload', async () => {
    const wrapper = mount(LeadFormView)

    await fillRequired(wrapper)
    await submitStep(wrapper)
    await submitStep(wrapper)
    await wrapper.find('#residentialUnits').setValue('2')
    await wrapper.find('#boilerRoomSize').setValue('mehr als 4 qm')
    await wrapper.find('#installationLocationCeilingHeight').setValue('180 - 199 cm')
    await wrapper.find('#widthPathway').setValue('Ja')
    await wrapper.find('#heightPathway').setValue('Nein')
    await wrapper.find('#typeOfHeating').setValue('Heizkörper')
    await wrapper.find('#locationHeating').setValue('Im Keller')
    await wrapper.find('#consumption').setValue('45000')
    await wrapper.find('#consumptionUnit').setValue('Kilowattstunden (kWh)')
    await wrapper.find('#systemType').setValue('Erdgas')
    await wrapper.find('#timeline').setValue('Sofort')
    await wrapper.find('#fullReplacementOfHeatingSystemPlanned').setValue('true')

    await submitStep(wrapper)
    await submitStep(wrapper)
    await flushPromises()

    expect(fetchSpy).toHaveBeenCalled()
    const firstCall = fetchSpy.mock.calls[0]
    expect(firstCall).toBeDefined()
    const request = firstCall?.[1] as RequestInit
    const body = JSON.parse(request.body as string)

    expect(body.building.buildingInformation.residentialUnits).toBe(2)
    expect(body.building.buildingInformation.boilerRoomSize).toBe('mehr als 4 qm')
    expect(body.building.buildingInformation.installationLocationCeilingHeight).toBe('180 - 199 cm')
    expect(body.building.buildingInformation.widthPathway).toBe('Ja')
    expect(body.building.buildingInformation.heightPathway).toBe('Nein')
    expect(body.building.energyRelevantInformation.typeOfHeating).toBe('Heizkörper')
    expect(body.building.energyRelevantInformation.locationHeating).toBe('Im Keller')
    expect(body.heatingSystem.consumption).toBe(45000)
    expect(body.heatingSystem.consumptionUnit).toBe('Kilowattstunden (kWh)')
    expect(body.heatingSystem.systemType).toBe('Erdgas')
    expect(body.project.timeline).toBe('Sofort')
    expect(body.project.fullReplacementOfHeatingSystemPlanned).toBe(true)
    expect(body.id).toBeUndefined()
  })
})
