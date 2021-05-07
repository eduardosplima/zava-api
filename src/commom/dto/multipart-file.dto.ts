import { IsNotEmpty, IsString } from 'class-validator';

export class MultipartFileDto {
  @IsString()
  @IsNotEmpty()
  encoding: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  filepath: string;

  @IsString()
  @IsNotEmpty()
  mimetype: string;
}
