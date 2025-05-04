import { v2 as cloudinary } from 'cloudinary';
import { Provider } from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import { APP_CLOUDINARY_PROVIDER } from '@root/modules/cloudinary';

export const CloudinaryProvider: Provider = {
  provide: APP_CLOUDINARY_PROVIDER,
  useFactory: (environmentService: EnvironmentService) => {
    cloudinary.config({
      cloud_name: environmentService.cloudinaryName,
      api_key: environmentService.cloudinaryApiKey,
      api_secret: environmentService.cloudinarySecret,
    });
    return cloudinary;
  },
  inject: [EnvironmentService],
};
