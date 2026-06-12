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
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  private async assertAccessToContractClient(
    contractId: string,
    user: { id: string; role: string },
  ) {
    const contract = await this.contractsService.findOne(contractId);
    await this.clientAccessPolicy.assertCanViewClient(
      user.id,
      user.role,
      contract.clientId,
    );
    return contract;
  }

  @Post()
  @Roles('admin', 'diretoria', 'gerencia')
  async create(
    @Body() createContractDto: CreateContractDto,
    @Req() req: RequestWithAuth,
  ) {
    await this.clientAccessPolicy.assertCanManageClient(
      req.user.id,
      req.user.role,
      createContractDto.clientId,
    );
    return this.contractsService.create(createContractDto);
  }

  @Get()
  async findAll(
    @Query('clientId') clientId: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: RequestWithAuth,
  ) {
    if (clientId) {
      await this.clientAccessPolicy.assertCanViewClient(
        req.user.id,
        req.user.role,
        clientId,
      );
    }
    return this.contractsService.findAll(clientId, req.user, { page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithAuth) {
    return this.assertAccessToContractClient(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'diretoria', 'gerencia')
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Req() req: RequestWithAuth,
  ) {
    const contract = await this.assertAccessToContractClient(id, req.user);
    await this.clientAccessPolicy.assertCanManageClient(
      req.user.id,
      req.user.role,
      contract.clientId,
    );
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria')
  async remove(@Param('id') id: string, @Req() req: RequestWithAuth) {
    await this.assertAccessToContractClient(id, req.user);
    await this.clientAccessPolicy.assertCanArchiveClient(req.user.role);
    return this.contractsService.remove(id);
  }
}
