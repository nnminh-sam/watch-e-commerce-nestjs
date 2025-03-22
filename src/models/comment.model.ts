import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  UserComment,
  UserCommentSchema,
} from '@root/models/user-comment.model';

@Schema({ timestamps: true, id: true })
export class Comment {
  @ApiProperty({
    description: 'User who made the comment',
    name: 'user_comment',
    type: UserComment,
  })
  @Prop({ type: UserCommentSchema, required: true })
  userComment: UserComment;

  @ApiProperty({
    example: 5,
    description: 'Rating given by the user',
    name: 'rating',
  })
  @Prop({ default: 5 })
  rating: number;

  @ApiProperty({
    example: 'Great product!',
    description: 'Comment content',
    name: 'content',
  })
  @Prop({ required: true })
  content: string;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'Attached images',
    name: 'assets',
  })
  @Prop({ default: [] })
  assets: string[];
}

const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { CommentSchema };
