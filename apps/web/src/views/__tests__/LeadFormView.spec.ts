import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LeadFormView from '../LeadFormView.vue'

describe('LeadFormView', () => {
  it('shows validation errors when required fields are missing', async () => {
    const wrapper = mount(LeadFormView)

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('First name is required')
    expect(wrapper.text()).toContain('Last name is required')
    expect(wrapper.text()).toContain('Phone is required')
    expect(wrapper.text()).toContain('Email is required')
  })
})
