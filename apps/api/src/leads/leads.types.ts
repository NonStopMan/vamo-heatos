export type LeadStage = 'qualification' | 'discovery' | 'selling';

export type LeadCreationResult = {
  leadStage: LeadStage;
  dataAcquisitionLink: string | null;
  appointmentBookingLink: string | null;
};

export type LeadRequestContext = {
  requestId?: string;
  sourceIp?: string;
  userAgent?: string;
};
