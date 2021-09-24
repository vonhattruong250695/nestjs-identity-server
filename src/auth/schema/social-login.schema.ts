import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SocialTypeEnum {
  Google = 'Google',
  Facebook = 'Facebook'
}

@Schema({ timestamps: true, collection: 'socialLogins' })
export class SocialLoginModel extends Document {
  @Prop({ type: String, enum: SocialTypeEnum })
  type: SocialTypeEnum;

  @Prop({ type: String })
  picture: string;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;

  @Prop({ type: String, required: false })
  photo: string;

  @Prop({ type: String, required: false })
  socialId: string;
}

export const SocialLoginSchema = SchemaFactory.createForClass(SocialLoginModel);
