import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@root/user/entities/user.model';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, id: true })
export class UserComment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({ required: true })
  fullName: string;
}

const UserCommentSchema = SchemaFactory.createForClass(UserComment);

export { UserCommentSchema };
