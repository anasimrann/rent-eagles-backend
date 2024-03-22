import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { orderBy } from 'lodash';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class S3Service {
  private readonly client = new S3Client({
    region: process.env.AWS_S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  });

  /*************************************COMMON S3*****************************************/
  async generateFilePath(file: Express.Multer.File) {
    const splittedFileName = file.originalname.split('.');
    const fileExtension = splittedFileName[splittedFileName.length - 1];
    return (
      Date.now() + '-' + Math.ceil(Math.random() * 1000) + '.' + fileExtension
    );
  }

  fileValidator(file: Express.Multer.File, fileType: string, maxSize: number) {
    const regex = fileType === 'image' ? /\.(jpg|jpeg|png)$/ : undefined;
    if (!file.originalname.match(regex)) {
      return { success: false, message: `Invalid ${fileType} file` };
    }
    if (file.size > maxSize) {
      return { success: false, message: 'File too large' };
    }
    return { success: true, message: 'Success' };
  }

  async delete(filePath: string) {
    const deleteObjectParams = {
      Bucket: 'renteagles',
      Key: `driver/${filePath}`,
    };
    const deleteObjectCommand = new DeleteObjectCommand(deleteObjectParams);
    await this.client.send(deleteObjectCommand);
  }

  /*************************************************************PRIVATE BUCKET****************************/
  async upload(filePath: string, buffer: Buffer) {
    let response = {
      message: '',
      success: true,
    };
    try {
      const putObjectParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `driver/${filePath}`,
        Body: buffer,
        Metadata: {
          filename: filePath,
        },
      };
      const putObjectCommand = new PutObjectCommand(putObjectParams);
      await this.client.send(putObjectCommand);
      return response;
    } catch (err) {
      response.message = err.message;
      response.success = false;
      return response;
    }
  }

  async getSignedUrlForDriver(key: string) {
    let expirytime = 60 * 60 * 48;
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `driver/${key}`,
    };
    const getObjectCommand = new GetObjectCommand(params);
    return await getSignedUrl(this.client, getObjectCommand, {
      expiresIn: expirytime,
    });
  }

  /********************************************************************PUBLIC BUCKET***********************************/
  async uploadToPublicBucket(filePath: string, buffer: Buffer) {
    let response = {
      message: '',
      success: true,
    };
    try {
      const putObjectParams = {
        Bucket: process.env.AWS_PUBLIC_BUCKET,
        Key: filePath,
        Body: buffer,
        Metadata: {
          filename: filePath,
        },
      };
      const putObjectCommand = new PutObjectCommand(putObjectParams);
      await this.client.send(putObjectCommand);
      return response;
    } catch (err) {
      response.message = err.message;
      response.success = false;
      return response;
    }
  }

  async getSignedUrlPublic(key: string) {
    let expirytime = 60 * 60 * 48;
    var params = {
      Bucket: process.env.AWS_PUBLIC_BUCKET,
      Key: key,
    };
    const getObjectCommand = new GetObjectCommand(params);
    return await getSignedUrl(this.client, getObjectCommand, {
      expiresIn: expirytime,
    });
  }
}
