import { JobProgress } from 'bullmq';

export class FileUploadDto {
  name: string;

  uploadStatus: JobProgress;

  message: string;
}
