import { Schema } from '@nestjs/mongoose';

@Schema({
  collection: 'categories',
  timestamps: true,
  id: true,
})
export class Category {
  name: string;
}
