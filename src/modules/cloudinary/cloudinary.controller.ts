import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { FileUploadResponseDto } from '@root/modules/cloudinary/dtos/file-upload-response.dto';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';
import { MulterExceptionFilter } from '@root/commons/filters/multer-exception.filter';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseFilters(MulterExceptionFilter)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ProtectedApi({
    summary: 'Upload file for testing',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    description: 'File successfully uploaded',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple image files (maximum 3 files allowed)',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 3,
        },
      },
    },
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueSuffix);
        },
      }),
      limits: {
        files: 3,
      },
      fileFilter: (req, _, callback) => {
        const fileCount = req.files
          ? (req.files as Express.Multer.File[]).length
          : 0;
        if (fileCount > 3) {
          return callback(new Error('Maximum of 3 files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFiles() images: Express.Multer.File[]) {
    await Promise.all(
      images.map(async (image: Express.Multer.File) => {
        await this.cloudinaryService.uploadFile(
          image,
          ResourceTypeEnum.TEST,
          '',
        );
      }),
    );

    return 'Files upload success';
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
