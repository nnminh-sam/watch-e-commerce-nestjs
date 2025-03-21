import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@root/models/user.model';
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

UserCommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { UserCommentSchema };
