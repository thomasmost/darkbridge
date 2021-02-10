import dotenv from 'dotenv';
import { ParameterizedContext } from 'koa';
dotenv.config();
import { AppointmentActivity } from '../models/appointment_activity.model';
import { sequelize } from '../sequelize';
import { getById } from './base.api';

describe('Base Api', () => {
  const testUserId = 'test_user_id';
  afterAll(() => {
    sequelize.close();
  });

  test('a generated getById function should 404 if the record does not exist', async (done) => {
    const getActivityById = getById(AppointmentActivity);

    const ctx = ({
      params: {
        id: 'foo',
      },
    } as unknown) as ParameterizedContext;

    await getActivityById(ctx);

    expect(ctx.body).toBeUndefined();
    expect(ctx.status).toBe(404);
    done();
  });

  test('a generated getById function should populate the context appropriately', async (done) => {
    const activity = await AppointmentActivity.create({
      action: 'canceled',
      acting_user_id: testUserId,
      appointment_id: 'test_appointment_id',
    });

    // It's hard to imagine a real circumstance where we'd want to look up an Activity record by id,
    // but it's a good test case
    const getActivityById = getById(AppointmentActivity);

    const activity_id = activity.id;

    const ctx = ({
      params: {
        id: activity_id,
      },
    } as unknown) as ParameterizedContext;

    await getActivityById(ctx);

    expect(ctx.body).toBeDefined();
    expect(ctx.body?.acting_user_id).toBe(testUserId);
    expect(ctx.status).toBe(200);
    done();
  });
});
