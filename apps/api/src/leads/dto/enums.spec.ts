import {
  AdditionalDisposalItem,
  HeatingSystemType,
  ImmoType,
  ProjectTimeline,
} from './enums';

describe('Lead DTO enums', () => {
  it('exposes expected enum values from the spec', () => {
    expect(ImmoType.Wohnung).toBe('Wohnung');
    expect(HeatingSystemType.Erdgas).toBe('Erdgas');
    expect(ProjectTimeline.Sofort).toBe('Sofort');
    expect(AdditionalDisposalItem.Heatpump).toBe('heatpump');
  });
});
