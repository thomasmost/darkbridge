import { Model, ModelAttributeColumnOptions } from 'sequelize';
import { RelationAttribute } from '../models/types';

type SwaggerProperty = {
  type?: 'string' | 'integer' | 'object';
  example?: string;
  format?: 'uuid' | 'email';
};

export const arrayOf = (model: Model) => ({
  type: 'array',
  items: swaggerSchemaFromModel(model),
});

export const swaggerSchemaFromModel = (model: Model) => {
  const swaggerProperties: Record<string, SwaggerProperty> = {};
  // Below casting is obviously sub-optimal, but the sequelize types don't
  // seem to believe that rawAttributes are accessible on an initialized model
  const { rawAttributes } = (model as unknown) as {
    rawAttributes: { [attribute: string]: ModelAttributeColumnOptions };
  };
  for (const key in rawAttributes) {
    swaggerProperties[key] = swaggerPropertyFromAttribute(rawAttributes[key]);
  }
  return {
    type: 'object',
    properties: swaggerProperties,
  } as SwaggerProperty;
};

export const swaggerPropertyFromAttribute = (
  attribute: ModelAttributeColumnOptions<Model>,
) => {
  let swaggerProperty: SwaggerProperty = {};
  if (attribute.primaryKey) {
    return {
      type: 'string',
      format: 'uuid',
    } as SwaggerProperty;
  }
  try {
    const typeString = attribute.type.toString({});
    switch (typeString) {
      case 'VARCHAR(255)':
        swaggerProperty.type = 'string';
        break;
      case 'NUMBER':
        swaggerProperty.type = 'integer';
        break;
      case 'DATETIME':
        swaggerProperty.type = 'string';
        break;
      case 'VIRTUAL':
        if ((attribute as RelationAttribute).model) {
          swaggerProperty = swaggerSchemaFromModel(
            (attribute as RelationAttribute).model,
          );
          break;
        }
        swaggerProperty.type = 'string';
        break;
      default:
        swaggerProperty.type = 'string';
        break;
    }
  } catch (err) {
    return {
      type: 'string',
    } as SwaggerProperty;
  }
  return swaggerProperty;
};
