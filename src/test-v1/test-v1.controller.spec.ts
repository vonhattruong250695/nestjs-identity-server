import { Test, TestingModule } from '@nestjs/testing';
import { TestV1Controller } from './test-v1.controller';

describe('TestV1Controller', () => {
  let controller: TestV1Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestV1Controller],
    }).compile();

    controller = module.get<TestV1Controller>(TestV1Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
