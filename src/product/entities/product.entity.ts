import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  

  specials: {

  }
}
