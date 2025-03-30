import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModel } from '@root/models';

@Schema({ timestamps: true })
export class Comment extends BaseModel {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c90',
    description: 'User ID',
    name: 'user_id',
  })
  @Prop({ required: true })
  userId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the commenter',
    name: 'full_name',
  })
  @Prop({ required: true })
  fullName: string;

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

  static transform(doc: any): any {
    return BaseModel.transform(doc);
  }
}

const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => Comment.transform(ret),
});
CommentSchema.post('findOne', (doc: any) => Comment.transform(doc));
CommentSchema.post('find', (docs: any) => {
  if (!docs || docs.length === 0) {
    return docs;
  }
  return docs.map((doc: any) => Comment.transform(doc));
});

export { CommentSchema };
