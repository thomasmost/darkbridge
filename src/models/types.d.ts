import { Model, ModelAttributeColumnOptions } from 'sequelize';

export type RelationAttribute<
  T extends Model = Model
> = ModelAttributeColumnOptions<T> & { model: Model };
