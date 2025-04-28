export interface UploadJob {
  file: Express.Multer.File;
  jobId: string;
  timestamp: number;
}
