import dotenv from 'dotenv';
import { ParameterizedContext } from 'koa';
dotenv.config();
import { User } from '../models/user.model';
import { sequelize } from '../sequelize';
import { register } from './auth.api';

describe('Auth Api', () => {
  afterAll(() => {
    sequelize.close();
  });
  test('registration should create a user', async (done) => {
    const email = 'jonathan@test.com';
    const password = 'password';
    const confirm_password = 'password';
    const ctx = ({
      request: {
        body: {
          email,
          password,
          confirm_password,
        },
      },
      cookies: {
        set: () => null,
      },
      ip: 'TEST::1',
    } as unknown) as ParameterizedContext;
    await register(ctx);

    const user = await User.findOne({
      where: {
        email: 'jonathan@test.com',
      },
    });

    expect(user?.id).toBeDefined();
    expect(user?.email).toBe(email);
    done();
  });
});
