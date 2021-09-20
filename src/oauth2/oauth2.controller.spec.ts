import { Test, TestingModule } from '@nestjs/testing';
import { Oauth2Controller } from '@oauth2/oauth2.controller';
import { Oauth2Service } from '@oauth2/services/oauth2.service';
import { ClientService } from '@oauth2/services/client.service';
import { AuthService } from '@auth/services/auth.service';

describe('Oauth2Controller unit testing', () => {
  let controller: Oauth2Controller;
  let oauth2Service: Oauth2Service;
  let clientService: ClientService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Oauth2Controller],
      providers: [
        {
          provide: Oauth2Service,
          useValue: {}
        },
        {
          provide: ClientService,
          useValue: {}
        },
        {
          provide: AuthService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<Oauth2Controller>(Oauth2Controller);
    oauth2Service = module.get<Oauth2Service>(Oauth2Service);
    clientService = module.get<ClientService>(ClientService);
    authService = module.get<AuthService>(AuthService);
  });

  it('Controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('', () => {});
});
