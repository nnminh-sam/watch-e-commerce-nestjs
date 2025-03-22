import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@root/models/user.model';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, id: true })
export class UserComment {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c90',
    description: 'User ID',
    name: 'user_id',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the commenter',
    name: 'full_name',
  })
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
