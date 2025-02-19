import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  UserComment,
  UserCommentSchema,
} from '@root/product/entities/user-comment.model';

@Schema({ timestamps: true, id: true })
export class Comment {
  @Prop({ type: UserCommentSchema, required: true })
  userComment: UserComment;

  @Prop({ default: 5 })
  rating: number;

  @Prop({ required: true })
  content: string;

  @Prop({ default: [] })
  assets: string[];
}

const CommentSchema = SchemaFactory.createForClass(Comment);

export { CommentSchema };
