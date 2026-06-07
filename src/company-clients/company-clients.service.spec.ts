import { Test, TestingModule } from '@nestjs/testing';
import { CompanyClientsService } from './company-clients.service';

describe('CompanyClientsService', () => {
  let service: CompanyClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyClientsService],
    }).compile();

    service = module.get<CompanyClientsService>(CompanyClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
