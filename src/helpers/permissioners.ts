/* eslint-disable @typescript-eslint/no-explicit-any */

import { Model } from 'sequelize';
import { User } from '../models/user.model';

export type Permissioner =
  | {
      execute: (permissioningData: any, requestingUser: User) => boolean;
      attributes?: string[];
      relations?: string[];
    }
  | boolean;

export const toUser: Permissioner = {
  execute: (permissioningData, user) => {
    return permissioningData.user_id === user.id;
  },
  attributes: ['user_id'],
};

export const toCreator: Permissioner = {
  execute: (permissioningData, user) => {
    return permissioningData.created_by_user_id === user.id;
  },
  attributes: ['created_by_user_id'],
};

export const toServiceProvider: Permissioner = {
  execute: (permissioningData, user) => {
    return permissioningData.service_provider_user_id === user.id;
  },
  attributes: ['service_provider_user_id'],
};

export const toSelf: Permissioner = {
  execute: (permissioningData, user) => {
    return permissioningData.id === user.id;
  },
  attributes: ['id'],
};

export function evaluatePermissioner(
  instance: Model,
  permissioner: Permissioner,
  requestingUser: User | undefined,
) {
  if (!permissioner) {
    return false;
  }
  if (typeof permissioner === 'boolean' || !requestingUser) {
    return permissioner;
  }

  if (!permissioner.execute) {
    throw new Error('permissioners should have an executor');
  }

  const dataForPermissioner: Record<string, any> = {};
  for (const permissioningRequirement of (permissioner.relations || []).concat(
    permissioner.attributes || [],
  )) {
    dataForPermissioner[permissioningRequirement] = (instance as any)[
      permissioningRequirement
    ];
  }
  const result = permissioner.execute(dataForPermissioner, requestingUser);
  if (typeof result !== 'boolean') {
    throw new Error(
      `Permissioning functions should always return a boolean; type was ${typeof result}`,
    );
  }
  return result;
}

function permissionersFromModel(model: Model) {
  const { rawAttributes } = (model as unknown) as {
    rawAttributes: {
      [attribute: string]: { visible: Permissioner };
    };
  };
  const permissionersByAttribute: Record<string, Permissioner> = {};
  for (const key in rawAttributes) {
    permissionersByAttribute[key] = rawAttributes[key].visible;
  }
  return permissionersByAttribute;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function permissionData(
  wholeData: any,
  requestingUser: User | undefined,
) {
  if (
    !wholeData ||
    wholeData instanceof Date ||
    !(typeof wholeData === 'object' || Array.isArray(wholeData))
  ) {
    return wholeData;
  }

  const permissioned: Record<string, unknown> | unknown[] = Array.isArray(
    wholeData,
  )
    ? []
    : {};

  if (!(wholeData instanceof Model)) {
    for (const key of Object.keys(wholeData)) {
      const data = permissionData(wholeData[key], requestingUser);
      if (data !== undefined) {
        (permissioned as any)[key] = data;
      }
    }
    return permissioned;
  }

  const permissionersByAttributeName = permissionersFromModel(wholeData);
  for (const property of Object.keys(permissionersByAttributeName)) {
    const permissioner = permissionersByAttributeName[property];
    if (evaluatePermissioner(wholeData, permissioner, requestingUser)) {
      const data = permissionData((wholeData as any)[property], requestingUser);
      if (data !== undefined) {
        (permissioned as any)[property] = data;
      }
    }
  }
  return permissioned;
}
