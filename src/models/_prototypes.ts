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
  model?: Model;
  swagger_definition_name?: string;
  swagger_type?: 'string' | 'integer' | 'number' | 'object' | 'boolean';
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
