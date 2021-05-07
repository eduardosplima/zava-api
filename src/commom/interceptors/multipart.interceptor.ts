import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { extname, join } from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import hexoid from 'hexoid';
import type { Observable } from 'rxjs';

import type { MultipartFileDto } from '../dto/multipart-file.dto';
import { MetadataEnum } from '../enums/metadata.enum';
import type { MultipartOptions } from '../interfaces/multipart-options.interface';

@Injectable()
export class MultipartInterceptor implements NestInterceptor {
  private readonly pump = promisify(pipeline);

  private readonly randomId = hexoid();

  constructor(private readonly reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const multipartOptions = this.reflector.get<MultipartOptions>(
      MetadataEnum.MULTIPART_OPTIONS_METADATA,
      context.getHandler(),
    ) || { strictType: false };

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();

    if (request.isMultipart()) {
      if (!request.body) {
        request.body = {};
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const part of request.parts()) {
        if (part.file) {
          const filename = this.randomId() + extname(part.filename);
          const filepath = join(tmpdir(), filename);
          const target = createWriteStream(filepath);
          await this.pump(part.file, target);

          const multipartFile: MultipartFileDto = {
            encoding: part.encoding,
            filename,
            filepath,
            mimetype: part.mimetype,
          };
          Object.assign(request.body, {
            [part.fieldname]: multipartFile,
          });
        } else {
          Object.assign(request.body, {
            [part.fieldname]: ((part as unknown) as { value: unknown }).value,
          });
        }
      }
    } else if (multipartOptions.strictType) {
      throw new UnsupportedMediaTypeException();
    }

    return next.handle();
  }
}
