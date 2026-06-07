import { Test, TestingModule } from '@nestjs/testing';
import { CompanyClientsController } from './company-clients.controller';

describe('CompanyClientsController', () => {
  let controller: CompanyClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyClientsController],
    }).compile();

    controller = module.get<CompanyClientsController>(CompanyClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
