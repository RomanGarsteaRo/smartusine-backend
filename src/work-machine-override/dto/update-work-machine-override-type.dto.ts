import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkMachineOverrideTypeDto } from './create-work-machine-override-type.dto';

export class UpdateWorkMachineOverrideTypeDto extends PartialType(CreateWorkMachineOverrideTypeDto) {
}
