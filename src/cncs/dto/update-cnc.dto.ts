import { PartialType } from '@nestjs/mapped-types';
import { CreateCncDto } from './create-cnc.dto';

export class UpdateCncDto extends PartialType(CreateCncDto) {}
