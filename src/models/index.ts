import { ApiProperty } from '@nestjs/swagger';

export class BaseModel {
  @ApiProperty({
    description: 'Document ID',
    example: '60d21b4667d0d8992e610c91',
  })
  id: string;

  @ApiProperty({
    description: 'Document version',
    example: '1',
    required: false,
  })
  version?: number;

  static transform(doc: any): any {
    if (doc._id) {
      doc.id = doc._id.toString();
      delete doc._id;
    }

    if (doc.__v) {
      doc.version = doc.__V;
      delete doc.__v;
    }

    return doc;
  }
}
