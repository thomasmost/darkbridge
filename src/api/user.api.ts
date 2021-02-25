import { UserAttributes } from '../models/user.model';
import { TeddyRequestContext } from './types';

import {
  request,
  summary,
  body,
  prefix,
  tags,
} from '@callteddy/koa-swagger-decorator';

const UserTag = tags(['users']);

@prefix('/user')
export class UserAPI {
  @UserTag
  @request('put', '/self')
  @summary('update currently logged in user')
  @body({
    phone: {
      type: 'string',
      required: true,
      description: "user's phone number",
    },
    given_name: {
      type: 'string',
      required: true,
      description: "user's given (usually first) name",
    },
    family_name: {
      type: 'string',
      required: true,
      description: "user's family (usually last) name",
    },
  })
  // @security([{ token: [] }])
  // @query({
  //   type: { type: 'number', required: true, default: 1, description: 'type' },
  // })
  public static async updateSelf(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }

    const { phone, given_name, family_name } = ctx.request
      .body as Partial<UserAttributes>;
    const user = ctx.user;

    if (phone) {
      user.phone = phone;
    }
    if (given_name) {
      user.given_name = given_name;
    }
    if (family_name) {
      user.family_name = family_name;
    }

    await user.save();

    ctx.status = 204;
  }
}
