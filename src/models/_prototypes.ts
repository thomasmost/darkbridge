/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DataType,
  InitOptions,
  Model,
  ModelAttributeColumnOptions,
  ModelStatic,
} from 'sequelize';
import { Permissioner } from '../helpers/permissioners';

export interface PermissionedModelAttributeColumnOptions
  extends ModelAttributeColumnOptions {
  visible: Permissioner;
}

type PermissionedModelAttributes<TCreationAttributes = any> = {
  /**
   * The description of a database column
   */
  [name in keyof TCreationAttributes]:
    | DataType
    | PermissionedModelAttributeColumnOptions;
};

export abstract class PermissionedModel<
  // eslint-disable-next-line @typescript-eslint/ban-types
  TModelAttributes extends {} = any,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
  public static initWithPermissions<M extends Model>(
    this: ModelStatic<M>,
    attributes: PermissionedModelAttributes<M['_attributes']>,
    options: InitOptions<M>,
  ) {
    return (this as any).init(attributes, options);
  }
}

export type RelationAttribute<
  T extends Model = Model
> = PermissionedModelAttributeColumnOptions & { model: Model };
