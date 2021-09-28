import { AuthMiddleware } from 'src/auth/middlewares/auth.middleware';

describe('AuthMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthMiddleware()).toBeDefined();
  });
});
