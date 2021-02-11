import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Koa from 'koa';
import Router from 'koa-router';
import validator from 'validator';
import { AuthenticationError, ValidationError } from '../helpers/error.helper';
import { AuthToken } from '../models/auth_token.model';
import { issueToken } from '../helpers/auth_token.helper';
import { User } from '../models/user.model';
import { VerifyEmailRequest } from '../models/verify_email_request.model';
import { sendEmail } from '../helpers/email.helper';
import { ResetPasswordRequest } from '../models/reset_password_request.model';

export const authAPI = new Router();

const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR || '12', 10);

const DEFAULT_BAD_REQUEST_MESSAGE = 'Must include a valid email and password';
const DEFAULT_FAILED_LOGIN_MESSAGE =
  'The provided email and password were not a match.';

export function tokenFromCookies(ctx: Koa.ParameterizedContext) {
  return ctx.cookies.get('teddy_web_token');
}

export async function logout(ctx: Koa.ParameterizedContext) {
  const tokenId = ctx.cookies.get('teddy_web_token');
  if (tokenId) {
    const token = await AuthToken.findOne({
      where: {
        id: tokenId,
      },
    });
    if (!token) {
      throw Error('Missing token');
    }
    console.log('FOUND TOKEN AND LOGGING OUT');

    ctx.cookies.set('teddy_web_token', null);

    // if !token log a warning

    await token.update({
      disabled_at: Date.now(),
      disabled_reason: 'logged_out',
    });
  } else {
    // log a warning
  }
}

export async function login(ctx: Koa.ParameterizedContext) {
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
    throw Error(DEFAULT_FAILED_LOGIN_MESSAGE);
  }

  const { password_salt } = user;

  const seasoned_password = `${password_salt}:${password}`;

  const ok = await bcrypt.compare(seasoned_password, user.password_hash);

  if (!ok) {
    throw Error(DEFAULT_FAILED_LOGIN_MESSAGE);
  }

  const client_type = 'web';
  const ip = ctx.ip;

  const token = await issueToken(user.id, 'email_password', client_type, ip);

  const cookie_options = {
    overwrite: true,
  };

  ctx.cookies.set('teddy_web_token', token, cookie_options);
  ctx.body = { token, user };
}

export async function register(ctx: Koa.ParameterizedContext) {
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
  await sendEmail(data);

  const cookie_options = {
    overwrite: true,
  };

  ctx.cookies.set('teddy_web_token', token, cookie_options);
  ctx.body = { token, user };
}

export async function requestPasswordReset(ctx: Koa.ParameterizedContext) {
  const { email } = ctx.request.body;

  if (!email) {
    throw new ValidationError('Email required to reset password');
  }

  if (!validator.isEmail(email)) {
    throw new ValidationError('Email not valid');
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
    To reset your password, <a href="${process.env.HOST_DOMAIN}/api/auth/reset_password?token=${resetPasswordRequest.verification_token}">click here</a>.
</div>
`,
    text: `To reset your password, visit ${process.env.HOST_DOMAIN}/api/auth/reset_password?token=${resetPasswordRequest.verification_token}`,
    // 'v:host': '',
    // 'v:token': resetPasswordRequest.verification_token,
  };
  await sendEmail(data);
  ctx.status = 204;
}

export async function verifyResetPassword(ctx: Koa.ParameterizedContext) {
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
    throw new ValidationError('This token has already been used!');
  }

  if (verificationRequest.created_at <= Date.now() - 30 * 60 * 1000) {
    throw new ValidationError('This token has expired');
  }

  user.password_hash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
  verificationRequest.fulfilled_at = Date.now();

  await Promise.all([user.save(), verificationRequest.save()]);

  return ctx.redirect('/');
}

export async function verifyEmail(ctx: Koa.ParameterizedContext) {
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
    throw new ValidationError('This token has already been used!');
  }

  if (verificationRequest.created_at <= Date.now() - 24 * 60 * 60 * 1000) {
    throw new ValidationError('This token has expired');
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

authAPI.post('/register', register);
authAPI.get('/verify_email', verifyEmail);
authAPI.post('/login', login);
authAPI.get('/logout', logout);
authAPI.get('/current_user', (ctx) => (ctx.body = (ctx as any).user));
