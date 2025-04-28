import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import {
  UploadStatus,
  UploadProgressEvent,
  UploadCompletedEvent,
  UploadFailedEvent,
} from './interfaces';

@Controller('upload')
export class CloudinaryController {
  private uploadStatuses: Map<string, UploadStatus> = new Map();

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter.on(
      'upload.progress',
      ({ jobId, progress }: UploadProgressEvent) => {
        const status = this.uploadStatuses.get(jobId);
        if (status) {
          status.progress = progress;
          this.uploadStatuses.set(jobId, status);
        }
      },
    );

    this.eventEmitter.on(
      'upload.completed',
      ({ jobId, result }: UploadCompletedEvent) => {
        this.uploadStatuses.set(jobId, {
          status: 'completed',
          result,
        });
      },
    );

    this.eventEmitter.on(
      'upload.failed',
      ({ jobId, error }: UploadFailedEvent) => {
        this.uploadStatuses.set(jobId, {
          status: 'failed',
          error,
        });
      },
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const jobId = await this.cloudinaryService.queueUpload(file);
    this.uploadStatuses.set(jobId, { status: 'queued' });

    return { jobId };
  }

  @Get('status/:jobId')
  getUploadStatus(@Param('jobId') jobId: string) {
    const status = this.uploadStatuses.get(jobId);
    if (!status) {
      throw new BadRequestException('Invalid job ID');
    }
    return status;
  }

  @Get('status/:jobId/stream')
  streamUploadStatus(@Param('jobId') jobId: string): Observable<UploadStatus> {
    return new Observable((subscriber) => {
      const status = this.uploadStatuses.get(jobId);
      if (!status) {
        subscriber.error(new BadRequestException('Invalid job ID'));
        return;
      }

      subscriber.next(status);

      const progressListener = ({
        jobId: eventJobId,
        progress,
      }: UploadProgressEvent) => {
        if (eventJobId === jobId) {
          const currentStatus = this.uploadStatuses.get(jobId);
          if (currentStatus) {
            subscriber.next({
              ...currentStatus,
              progress,
              status: currentStatus.status,
            });
          }
        }
      };

      const completeListener = ({
        jobId: eventJobId,
        result,
      }: UploadCompletedEvent) => {
        if (eventJobId === jobId) {
          subscriber.next({ status: 'completed', result });
          subscriber.complete();
        }
      };

      const errorListener = ({
        jobId: eventJobId,
        error,
      }: UploadFailedEvent) => {
        if (eventJobId === jobId) {
          subscriber.error(error);
        }
      };

      this.eventEmitter.on('upload.progress', progressListener);
      this.eventEmitter.on('upload.completed', completeListener);
      this.eventEmitter.on('upload.failed', errorListener);

      return () => {
        this.eventEmitter.off('upload.progress', progressListener);
        this.eventEmitter.off('upload.completed', completeListener);
        this.eventEmitter.off('upload.failed', errorListener);
      };
    });
  }
}
