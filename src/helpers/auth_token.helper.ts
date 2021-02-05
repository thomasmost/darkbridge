import { AuthToken, ClientType } from '../models/auth_token.model';
import { User } from '../models/user.model';
import { IUserDto } from '../shared/user.dto';
import { AuthenticationError } from './error.helper';

export async function issueToken(
  user_id: string,
  auth_method: string,
  client_type: ClientType,
  device_id: string,
) {
  // const requestId = store.requestId;
  // console.log(`Issuing a new auth token for user_id ${user_id}; requestId=${requestId}`);
  const token = await AuthToken.create({
    user_id,
    auth_method,
    client_type,
    device_id,
  });

  return token.id as string;
}

export async function consumeToken(tokenId: string): Promise<IUserDto> {
  const token = await AuthToken.findOne({
    where: {
      id: tokenId,
    },
  });

  if (!token) {
    throw new AuthenticationError('Unrecognized token');
  }

  if (token.disabled_at && token.disabled_at <= Date.now()) {
    throw new AuthenticationError('Invalid token');
  }
  if (
    token.last_used_at &&
    token.last_used_at <= Date.now() - 1 * 60 * 60 * 1000
  ) {
    await token.update({
      disabled_at: Date.now(),
      disabled_reason: 'expired',
    });
    throw new AuthenticationError('Token expired');
  }

  const userPromise = User.findOne({
    where: {
      id: token.user_id,
    },
  });

  const tokenPromise = token.update({
    last_used_at: Date.now(),
  });

  const [user] = await Promise.all([userPromise, tokenPromise]);

  if (!user) {
    throw Error('Missing user');
  }

  const permissionedUser = {
    id: user.id,
    email: user.email,
    given_name: user.given_name,
    family_name: user.family_name,
    created_at: user.created_at,
    verified_at: user.verified_at,
  };

  console.log(`RETURNING USER ${permissionedUser.given_name}`);

  return permissionedUser;
}
