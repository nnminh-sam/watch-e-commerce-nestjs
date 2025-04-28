import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { UploadJob } from './interfaces';

@Injectable()
export class CloudinaryService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_WIDTH = 1920;
  private readonly MAX_HEIGHT = 1080;
  private uploadQueue: UploadJob[] = [];
  private activeWorkers: Map<string, Worker> = new Map();
  private readonly MAX_CONCURRENT_UPLOADS = 3;

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter2,
  ) {
    cloudinary.config({
      cloud_name: this.environmentService.cloudinaryName,
      api_key: this.environmentService.cloudinaryApiKey,
      api_secret: this.environmentService.cloudinarySecret,
    });
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async queueUpload(file: Express.Multer.File): Promise<string> {
    const jobId = this.generateJobId();
    const job: UploadJob = {
      file,
      jobId,
      timestamp: Date.now(),
    };

    this.uploadQueue.push(job);
    this.logger.debug(
      `Queued upload job ${jobId} for file: ${file.originalname}`,
      `${CloudinaryService.name}.queueUpload`,
    );

    this.processQueue();
    return jobId;
  }

  private processQueue() {
    while (
      this.uploadQueue.length > 0 &&
      this.activeWorkers.size < this.MAX_CONCURRENT_UPLOADS
    ) {
      const job = this.uploadQueue.shift();
      if (!job) continue;

      this.startWorker(job);
    }
  }

  private startWorker(job: UploadJob) {
    const worker = new Worker(join(__dirname, 'workers/upload.worker.js'), {
      workerData: {
        file: {
          buffer: job.file.buffer,
          originalname: job.file.originalname,
          mimetype: job.file.mimetype,
        },
        config: {
          cloud_name: this.environmentService.cloudinaryName,
          api_key: this.environmentService.cloudinaryApiKey,
          api_secret: this.environmentService.cloudinarySecret,
        },
        options: {
          folder: 'uploads',
          quality: 'auto:good',
          fetch_format: 'auto',
          width: this.MAX_WIDTH,
          height: this.MAX_HEIGHT,
          crop: 'limit',
          resource_type: 'auto' as const,
          use_filename: true,
          unique_filename: true,
        },
      },
    });

    this.activeWorkers.set(job.jobId, worker);

    worker.on('message', (message) => {
      if (message.type === 'success') {
        this.eventEmitter.emit('upload.completed', {
          jobId: job.jobId,
          result: message.result,
          timestamp: Date.now(),
        });
      } else {
        this.eventEmitter.emit('upload.failed', {
          jobId: job.jobId,
          error: message.error,
          timestamp: Date.now(),
        });
      }
    });

    worker.on('error', (error) => {
      this.logger.error(
        `Worker error for job ${job.jobId}: ${error.message}`,
        error.stack,
        `${CloudinaryService.name}.startWorker`,
      );
      this.eventEmitter.emit('upload.failed', {
        jobId: job.jobId,
        error,
        timestamp: Date.now(),
      });
    });

    worker.on('exit', (code) => {
      this.activeWorkers.delete(job.jobId);
      if (code !== 0) {
        this.logger.error(
          `Worker stopped with exit code ${code} for job ${job.jobId}`,
          `${CloudinaryService.name}.startWorker`,
        );
      }
      // Process next job in queue
      this.processQueue();
    });
  }
}
