import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { Role } from '@root/models/enums/role.enum';
import { Transaction } from '@root/models/transaction.model';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { FindTransactionDto } from '@root/modules/transaction/dto/find-transaction.dto';
import { TransactionService } from '@root/modules/transaction/transaction.service';

@ApiTags('Transactions')
@HasRoles([Role.ADMIN, Role.EMPLOYEE])
@UseGuards(RoleGuard)
@UseGuards(JwtGuard)
@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ProtectedApi({
    summary: 'Find user transaction by transaction ID',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: Transaction,
    key: 'transaction',
    description: 'Transaction found',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid transaction ID',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  @Get('/{id}')
  async findOne(@Param('id') id: string) {
    return await this.transactionService.findOne(id);
  }

  @ProtectedApi({
    summary: 'Find user transactions',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: Transaction,
    key: 'transactions',
    description: 'Transaction found',
    isArray: true,
  })
  @Get()
  async find(@Query() findTransactionDto: FindTransactionDto) {
    return await this.transactionService.find(findTransactionDto);
  }
}
