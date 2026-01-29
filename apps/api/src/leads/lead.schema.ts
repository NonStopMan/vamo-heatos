import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: String, unique: true, sparse: true })
  externalId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload!: Record<string, unknown>;

  @Prop({ type: String, enum: ['pending', 'synced', 'failed'], default: 'pending' })
  crmStatus!: 'pending' | 'synced' | 'failed';

  @Prop({ type: Number, default: 0 })
  crmRetries!: number;

  @Prop({ type: String })
  crmLastError?: string | null;

  @Prop({ type: Date })
  crmLastAttemptAt?: Date | null;

  @Prop({ type: Date })
  crmSyncedAt?: Date | null;
}

export type LeadDocument = HydratedDocument<Lead>;

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ crmStatus: 1, crmRetries: 1, createdAt: 1 });
