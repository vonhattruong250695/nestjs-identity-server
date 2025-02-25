import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'socialLogins' })
export class SocialLoginModel extends Document {
  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  picture: string;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;
}

export const SocialLoginSchema = SchemaFactory.createForClass(SocialLoginModel);
