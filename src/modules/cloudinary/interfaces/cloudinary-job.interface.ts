import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';

export interface CloudinaryJob {
  filePath: string;
  resourceType: ResourceTypeEnum;
  objectId: string;
}
