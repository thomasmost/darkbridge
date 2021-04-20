import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Koa from 'koa';
import Router from 'koa-router';
import { UserAgentContext } from 'koa-useragent';
import validator from 'validator';
import { AuthenticationError, BadRequestError } from '../helpers/error.helper';
import { AuthToken, ClientType } from '../models/auth_token.model';
import { issueToken } from '../helpers/auth_token.helper';
import { User, UserModel } from '../models/user.model';
import { VerifyEmailRequest } from '../models/verify_email_request.model';
import { sendEmail } from '../helpers/email.helper';
import { ResetPasswordRequest } from '../models/reset_password_request.model';
import { AuthenticatedRequestContext } from './types';
import { ContractorProfile } from '../models/contractor_profile.model';
import {
  body,
  middlewares,
  operation,
  prefix,
  query,
  request,
  responses,
  security,
  summary,
  tagsAll,
} from '@callteddy/koa-swagger-decorator';
import {
  baseCodes,
  swaggerRefFromDefinitionName,
  swaggerRefFromModel,
} from '../helpers/swagger.helper';
import { authUser } from './middlewares';

export const authAPI = new Router();

const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR || '12', 10);

const DEFAULT_BAD_REQUEST_MESSAGE = 'Must include a valid email and password';
const DEFAULT_FAILED_LOGIN_MESSAGE =
  'The provided email and password were not a match.';

export function tokenFromCookies(ctx: Koa.ParameterizedContext) {
  return ctx.cookies.get('teddy_web_token');
}

export function tokenFromAuthorizationHeader(ctx: Koa.ParameterizedContext) {
  const { headers } = ctx.request;
  const authHeader = headers['authorization'];
  if (!authHeader) {
    return null;
    // throw new AuthenticationError('Missing Authorization Header');
  }
  const bearerParts = authHeader.split(' ');
  if (
    !bearerParts ||
    bearerParts.length != 2 ||
    bearerParts[0].toLowerCase() !== 'bearer' ||
    !bearerParts[1]
  ) {
    throw new AuthenticationError(
      'Authorization Header is expected to comply with rfc6750 and rfc2617',
    );
  }
  return bearerParts[1];
}

const registrationBody = {
  email: {
    type: 'string',
    required: true,
    description: 'username',
  },
  password: {
    type: 'string',
    required: true,
    description: 'password',
  },
  confirm_password: {
    type: 'string',
    required: true,
    description: 'password',
  },
};

@prefix('/auth')
@tagsAll(['auth'])
export class AuthAPI {
  @request('post', '/login')
  @operation('apiAuth_login')
  @summary('Log in, retrieving a new token as well as the user object')
  @body({
    email: {
      type: 'string',
      required: true,
      description: 'username',
    },
    password: {
      type: 'string',
      required: true,
      description: 'password',
    },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('AuthenticationResult'),
    },
    ...baseCodes([400, 401]),
  })
  public static async login(ctx: Koa.ParameterizedContext & UserAgentContext) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      throw new AuthenticationError(DEFAULT_BAD_REQUEST_MESSAGE);
    }

    if (!validator.isEmail(email)) {
      throw new AuthenticationError(DEFAULT_BAD_REQUEST_MESSAGE);
    }

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new AuthenticationError(DEFAULT_FAILED_LOGIN_MESSAGE);
    }

    const { password_salt } = user;

    const seasoned_password = `${password_salt}:${password}`;

    const ok = await bcrypt.compare(seasoned_password, user.password_hash);

    if (!ok) {
      throw Error(DEFAULT_FAILED_LOGIN_MESSAGE);
    }

    let client_type: ClientType = 'web';
    if (ctx.userAgent.isAndroid || ctx.userAgent.isAndroidTablet) {
      client_type = 'android';
    }
    if (ctx.userAgent.isiPhone || ctx.userAgent.isiPad) {
      client_type = 'ios';
    }

    const ip = ctx.ip;

    const token = await issueToken(user.id, 'email_password', client_type, ip);

    const cookie_options = {
      overwrite: true,
    };

    ctx.cookies.set('teddy_web_token', token, cookie_options);
    ctx.body = { token, user };
  }

  @request('post', '/register')
  @operation('apiAuth_register')
  @summary('Register a new user')
  @body(registrationBody)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('AuthenticationResult'),
    },
    ...baseCodes([400]),
  })
  public static async register(ctx: Koa.ParameterizedContext) {
    const { email, password, confirm_password } = ctx.request.body;

    if (!email || !password || !confirm_password) {
      throw new Error(DEFAULT_BAD_REQUEST_MESSAGE);
    }

    if (!validator.isEmail(email)) {
      throw new Error(DEFAULT_BAD_REQUEST_MESSAGE);
    }

    if (password !== confirm_password) {
      throw new Error('Passwords must match');
    }
    const password_salt = crypto.randomBytes(16).toString();

    const seasoned_password = `${password_salt}:${password}`;

    const password_hash = await bcrypt.hash(
      seasoned_password,
      BCRYPT_WORK_FACTOR,
    );

    const user = await User.create({
      email,
      password_hash,
      password_salt,
    });

    const user_id = user.id;
    const email_type = 'primary';

    const client_type = 'web';
    const ip = ctx.ip;

    const tokenPromise = issueToken(user_id, 'registration', client_type, ip);

    const verifyEmailPromise = VerifyEmailRequest.create({
      email,
      email_type,
      user_id,
    });

    const [token, verifyEmailRequest] = await Promise.all([
      tokenPromise,
      verifyEmailPromise,
    ]);

    const data = {
      to: email,
      subject: 'Welcome!',
      html: `
<div>
    To verify your email,
    <a href="${process.env.HOST_DOMAIN}/api/auth/verify_email?token=${verifyEmailRequest.verification_token}">
      click here
    </a>.
</div>
`,
      text: `To verify your email, visit ${process.env.HOST_DOMAIN}/api/auth/verify_email?token=${verifyEmailRequest.verification_token}`,
      // 'v:host': '',
      // 'v:token': verifyEmailRequest.verification_token,
    };
    try {
      await sendEmail(data);
    } catch (err) {
      console.log(`Failed to send verification email; err=${err}`);
    }

    const cookie_options = {
      overwrite: true,
    };

    ctx.cookies.set('teddy_web_token', token, cookie_options);
    ctx.body = { token, user };
  }

  @request('post', '/request_password_reset')
  @operation('apiAuth_requestPasswordReset')
  @summary('Request a password reset')
  @body({
    email: {
      type: 'string',
      required: true,
      description: 'username',
    },
  })
  @responses({
    204: {
      description: 'Success',
    },
    ...baseCodes([400]),
  })
  public static async requestPasswordReset(ctx: Koa.ParameterizedContext) {
    const { email } = ctx.request.body;

    if (!email) {
      throw new BadRequestError('Email required to reset password');
    }

    if (!validator.isEmail(email)) {
      throw new BadRequestError('Email not valid');
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    const resetPasswordRequest = await ResetPasswordRequest.create({
      email_sent_to: email,
      user_id: user.id,
    });

    const data = {
      to: email,
      subject: 'Reset your password',
      html: `
<div>
    To reset your password, <a href="${process.env.HOST_DOMAIN}/reset_password/${resetPasswordRequest.verification_token}">click here</a>.
</div>
`,
      text: `To reset your password, visit ${process.env.HOST_DOMAIN}/reset_password/${resetPasswordRequest.verification_token}`,
      // 'v:host': '',
      // 'v:token': resetPasswordRequest.verification_token,
    };
    await sendEmail(data);
    ctx.status = 204;
  }

  @request('post', '/verify_password_reset')
  @operation('apiAuth_verifyPasswordReset')
  @summary('Verify a password reset and change the password')
  @body({
    token: {
      type: 'string',
      required: true,
      description: 'the unique id for the request, consumed after first use',
    },
    password: {
      type: 'string',
      required: true,
      description: 'password',
    },
    confirm_password: {
      type: 'string',
      required: true,
      description: 'password',
    },
  })
  @responses(baseCodes([204, 400]))
  public static async verifyPasswordReset(ctx: Koa.ParameterizedContext) {
    const { token, password, confirm_password } = ctx.request.body;

    if (!token) {
      ctx.body = 'No token provided';
      return;
    }

    if (password !== confirm_password) {
      throw new AuthenticationError('Passwords must match');
    }

    const verificationRequest = await ResetPasswordRequest.findOne({
      where: {
        verification_token: token,
      },
    });

    if (!verificationRequest) {
      ctx.status = 400;
      return;
    }

    const user_id = verificationRequest.user_id;

    const user = await User.findByPk(user_id);

    if (!user) {
      ctx.status = 400;
      return;
    }

    console.log(`Found user ${user.given_name}!`);

    if (verificationRequest.fulfilled_at) {
      throw new BadRequestError('This token has already been used!');
    }

    if (verificationRequest.created_at <= Date.now() - 30 * 60 * 1000) {
      throw new BadRequestError('This token has expired');
    }

    const { password_salt } = user;
    const seasoned_password = `${password_salt}:${password}`;

    user.password_hash = await bcrypt.hash(
      seasoned_password,
      BCRYPT_WORK_FACTOR,
    );
    verificationRequest.fulfilled_at = Date.now();

    await Promise.all([user.save(), verificationRequest.save()]);

    return (ctx.status = 204);
  }

  @request('get', '/verify_email')
  @operation('apiAuth_verifyEmail')
  @summary('Verify an email address')
  @query({
    token: {
      type: 'string',
      required: true,
      description:
        'the unique id of the verification record, consumed after first use',
    },
  })
  @responses(baseCodes([302, 400]))
  public static async verifyEmail(ctx: Koa.ParameterizedContext) {
    const token = ctx.query.token;
    console.log('hello');
    if (!token) {
      ctx.body = 'No token provided';
      return;
    }
    const verificationRequest = await VerifyEmailRequest.findOne({
      where: {
        verification_token: token,
      },
    });

    if (!verificationRequest) {
      ctx.status = 400;
      return;
    }

    const user_id = verificationRequest.user_id;

    const user = await User.findByPk(user_id);

    if (!user) {
      ctx.status = 400;
      return;
    }

    console.log(`Found user ${user.given_name}!`);

    if (verificationRequest.fulfilled_at) {
      throw new BadRequestError('This token has already been used!');
    }

    if (verificationRequest.created_at <= Date.now() - 24 * 60 * 60 * 1000) {
      throw new BadRequestError('This token has expired');
    }

    if (verificationRequest.email_type === 'primary') {
      if (!user.verified_at) {
        user.verified_at = Date.now();
      }
      user.email = verificationRequest.email;
    } else {
      throw Error('Not Yet Implemented');
    }
    verificationRequest.fulfilled_at = Date.now();

    await Promise.all([user.save(), verificationRequest.save()]);

    return ctx.redirect('/');
  }

  @request('get', '/current_user')
  @operation('apiAuth_getCurrentUser')
  @summary('Get the currently logged in user')
  @security([{ token: [] }])
  @middlewares(authUser)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(UserModel),
    },
    ...baseCodes([401]),
  })
  public static async getCurrentUser(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;
    const contractor_profile = await ContractorProfile.findOne({
      where: {
        user_id: user.id,
      },
    });
    if (contractor_profile) {
      user.contractor_profile = contractor_profile;
    }
    ctx.body = user;
  }

  @request('get', '/logout')
  @operation('apiAuth_logout')
  @summary('Log out, voiding the current token and clearing the cookie')
  @responses(baseCodes([204, 400]))
  public static async logout(ctx: Koa.ParameterizedContext) {
    let tokenId = tokenFromAuthorizationHeader(ctx);
    if (!tokenId) {
      tokenId = tokenFromCookies(ctx);
    }
    if (tokenId) {
      const token = await AuthToken.findOne({
        where: {
          id: tokenId,
        },
      });
      if (!token) {
        throw Error('Missing token');
        // if !token log a warning
      }
      console.log('FOUND TOKEN AND LOGGING OUT');
      ctx.cookies.set('teddy_web_token', null);

      await token.update({
        disabled_at: Date.now(),
        disabled_reason: 'logged_out',
      });
      ctx.status = 204;
    } else {
      // if !token log a warning
      ctx.status = 400;
    }
  }
}
