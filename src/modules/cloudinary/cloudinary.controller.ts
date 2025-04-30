import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { FileUploadResponseDto } from '@root/modules/cloudinary/dtos/file-upload-response.dto';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @ProtectedApi({
    summary: 'Upload file for testing',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: FileUploadResponseDto,
    key: 'upload',
    description: 'File successfully uploaded',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueSuffix);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.cloudinaryService.uploadFile(
      file,
      ResourceTypeEnum.TEST,
      '',
    );
  }

  @ProtectedApi({
    summary: 'Find file upload process status',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: FileUploadResponseDto,
    key: 'upload',
    description: 'File upload process found',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Get('/status/:id')
  async findJobStatus(@Param('id') id: string) {
    return await this.cloudinaryService.findJobStatus(id);
  }
}
