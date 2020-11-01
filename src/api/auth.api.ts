import bcrypt from 'bcrypt';
import Koa from 'koa';
import validator from 'validator';
import { AuthenticationError } from '../helpers/error.helper';
import { AuthToken } from '../models/auth_token.model';
import { issueToken } from '../helpers/auth_token.helper';
import { User } from '../models/user.model';
import { VerifyEmailRequest } from '../models/verify_email_request.model';

const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR || '12', 10);

const DEFAULT_BAD_REQUEST_MESSAGE = 'Must include a valid email and password';
const DEFAULT_FAILED_LOGIN_MESSAGE =
  'The provided email and password were not a match.';

export function tokenFromAuthorizationHeader(authHeader: string) {
  if (!authHeader) {
    throw new AuthenticationError('Missing Authorization Header');
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

export async function logout(ctx: Koa.ParameterizedContext) {
  const { headers } = ctx.request;
  const authHeader = headers['authorization'];
  if (authHeader) {
    const tokenId = tokenFromAuthorizationHeader(authHeader);

    const token = await AuthToken.findOne({
      where: {
        id: tokenId,
      },
    });
    if (!token) {
      throw Error('Missing token');
    }
    console.log('FOUND TOKEN AND LOGGING OUT');

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

  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    throw Error(DEFAULT_FAILED_LOGIN_MESSAGE);
  }

  const token = await issueToken(user.id, 'email_password');

  ctx.body = { token, user };
}

export async function register(ctx: Koa.ParameterizedContext) {
  const {
    email,
    password,
    confirm_password,
    given_name,
    family_name,
  } = ctx.request.body;

  if (!email || !password || !confirm_password) {
    throw new Error(DEFAULT_BAD_REQUEST_MESSAGE);
  }

  if (!validator.isEmail(email)) {
    throw new Error(DEFAULT_BAD_REQUEST_MESSAGE);
  }

  if (password !== confirm_password) {
    throw new Error('Passwords must match');
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

  const user = await User.create({
    email,
    password_hash,
    given_name,
    family_name,
  });

  const user_id = user.id;
  const email_type = 'primary';

  const tokenPromise = issueToken(user_id, 'registration');

  const verifyEmailPromise = VerifyEmailRequest.create({
    email,
    email_type,
    user_id,
  });

  const [token] = await Promise.all([tokenPromise, verifyEmailPromise]);

  // const data = {
  //   to: email,
  //   subject: 'Welcome!',
  //   template: 'welcome',
  //   'v:host': '',
  //   'v:token': verifyEmail.verification_token,
  // };
  // await handleSendEmail(data);

  ctx.body = { token, user };
}

// export async function requestPasswordReset(ctx: Koa.ParameterizedContext) {
//   const { email } = ctx.request.body;

//   if (!email) {
//     throw new ValidationError('Email required to reset password');
//   }

//   if (!validator.isEmail(email)) {
//     throw new ValidationError('Email not valid');
//   }

//   const user = await User.findOne({
//     where: {
//       email,
//     },
//   });

//   if (!user) {
//     return;
//   }

//   const resetPasswordRequest = await ResetPasswordRequest.create({
//     email_sent_to: email,
//     user_id: user.id,
//   });

//   const data = {
//     to: email,
//     subject: 'Reset your password',
//     template: 'reset_password',
//     'v:host': '',
//     'v:token': resetPasswordRequest.verification_token,
//   };
//   await handleSendEmail(data);
//   ctx.status = 204;
// }

// export async function verifyResetPassword(ctx: Koa.ParameterizedContext) {
//   const { token, password, confirm_password } = ctx.request.body;

//   if (!token) {
//     ctx.body = 'No token provided';
//     return;
//   }

//   if (password !== confirm_password) {
//     throw new AuthenticationError('Passwords must match');
//   }

//   const verificationRequest = await ResetPasswordRequest.findOne({
//     where: {
//       verification_token: token,
//     },
//   });

//   const user_id = verificationRequest.user_id;

//   const user = await User.findByPk(user_id);

//   console.log(`Found user ${user.given_name}!`);

//   if (verificationRequest.fulfilled_at) {
//     throw new ValidationError('This token has already been used!');
//   }

//   if (verificationRequest.created_at <= Date.now() - 30 * 60 * 1000) {
//     throw new ValidationError('This token has expired');
//   }

//   user.password_hash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
//   verificationRequest.fulfilled_at = Date.now();

//   await Promise.all([user.save(), verificationRequest.save()]);

//   return ctx.redirect('/');
// }

// export async function verifyEmail(ctx: Koa.ParameterizedContext) {
//   const token = ctx.query.token;
//   if (!token) {
//     ctx.body = 'No token provided';
//     return;
//   }
//   const verificationRequest = await VerifyEmailRequest.findOne({
//     where: {
//       verification_token: token,
//     },
//   });

//   const user_id = verificationRequest.user_id;

//   const user = await User.findByPk(user_id);

//   console.log(`Found user ${user.given_name}!`);

//   if (verificationRequest.fulfilled_at) {
//     throw new ValidationError('This token has already been used!');
//   }

//   // if (verificationRequest.created_at <= Date.now() - 24 * 60 * 60 * 1000) {
//   //   throw new ValidationError('This token has expired');
//   // }

//   if (verificationRequest.email_type === 'primary') {
//     if (!user.verified_at) {
//       user.verified_at = Date.now();
//     }
//     user.email = verificationRequest.email;
//   } else {
//     throw Error('Not Yet Implemented');
//   }
//   verificationRequest.fulfilled_at = Date.now();

//   await Promise.all([user.save(), verificationRequest.save()]);

//   return ctx.redirect('/');
// }
