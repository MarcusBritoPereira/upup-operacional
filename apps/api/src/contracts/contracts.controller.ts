import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  private async assertAccessToContractClient(contractId: string, user: any) {
    const contract = await this.contractsService.findOne(contractId);
    await this.clientAccessPolicy.assertCanAccess(user.id, user.role, contract.clientId);
    return contract;
  }

  @Post()
  @Roles('admin', 'diretoria', 'gerencia')
  async create(@Body() createContractDto: CreateContractDto, @Req() req: any) {
    await this.clientAccessPolicy.assertCanAccess(req.user.id, req.user.role, createContractDto.clientId);
    return this.contractsService.create(createContractDto);
  }

  @Get()
  async findAll(@Query('clientId') clientId: string | undefined, @Req() req: any) {
    if (clientId) {
      await this.clientAccessPolicy.assertCanAccess(req.user.id, req.user.role, clientId);
    }
    return this.contractsService.findAll(clientId, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.assertAccessToContractClient(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'diretoria', 'gerencia')
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Req() req: any,
  ) {
    await this.assertAccessToContractClient(id, req.user);
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.assertAccessToContractClient(id, req.user);
    return this.contractsService.remove(id);
  }
}
