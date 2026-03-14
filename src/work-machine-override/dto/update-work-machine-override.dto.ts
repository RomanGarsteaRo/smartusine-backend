import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkMachineOverrideDto } from './create-work-machine-override.dto';

export class UpdateWorkMachineOverrideDto extends PartialType(CreateWorkMachineOverrideDto) {
}
