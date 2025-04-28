import { parentPort, workerData } from 'worker_threads';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

interface WorkerData {
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
  config: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
  options: {
    folder: string;
    quality: string;
    fetch_format: string;
    width: number;
    height: number;
    crop: string;
    resource_type: string;
    use_filename: boolean;
    unique_filename: boolean;
  };
}

const { file, config, options } = workerData as WorkerData;

// Configure cloudinary in the worker
cloudinary.config(config);

// Create a readable stream from the buffer
const stream = Readable.from(file.buffer);

// Create upload stream
const uploadStream = cloudinary.uploader.upload_stream(
  options,
  (error, result) => {
    if (error) {
      parentPort?.postMessage({ type: 'error', error });
    } else if (result) {
      parentPort?.postMessage({ type: 'success', result });
    } else {
      parentPort?.postMessage({
        type: 'error',
        error: 'No result from upload',
      });
    }
  },
);

// Pipe the file stream to the upload stream
stream.pipe(uploadStream);
