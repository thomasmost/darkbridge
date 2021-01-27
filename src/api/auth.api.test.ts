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
    const given_name = 'Jonathan';
    const family_name = 'Strange';
    const ctx = {
      request: {
        body: {
          email,
          password,
          confirm_password,
          given_name,
          family_name,
        },
      },
    };
    await register(ctx as ParameterizedContext);

    const user = await User.findOne({
      where: {
        email: 'jonathan@test.com',
      },
    });

    expect(user?.id).toBeDefined();
    expect(user?.given_name).toBe('Jonathan');
    done();
  });
});
