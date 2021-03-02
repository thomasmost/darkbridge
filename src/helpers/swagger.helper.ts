import { Model, ModelAttributeColumnOptions } from 'sequelize';

type SwaggerProperty = {
  type?: 'string' | 'integer';
  example?: string;
  format?: 'uuid' | 'email';
};

export const arrayOf = (model: Model) => ({
  type: 'array',
  items: sequelizeModelToSwaggerSchema(model),
});

export const sequelizeModelToSwaggerSchema = (model: Model) => {
  const swaggerProperties: Record<string, SwaggerProperty> = {};
  // Below casting is obviously sub-optimal, but the sequelize types don't
  // seem to believe that rawAttributes are accessible on an initialized model
  const { rawAttributes } = (model as unknown) as {
    rawAttributes: { [attribute: string]: ModelAttributeColumnOptions };
  };
  for (const key in rawAttributes) {
    const swaggerProperty: SwaggerProperty = {};
    if (rawAttributes[key].primaryKey) {
      swaggerProperties[key] = {
        type: 'string',
        format: 'uuid',
      };
      continue;
    }
    try {
      const typeString = rawAttributes[key].type.toString({});
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
          swaggerProperty.type = 'string';
          break;
        default:
          swaggerProperty.type = 'string';
          break;
      }
    } catch (err) {
      swaggerProperties[key] = {
        type: 'string',
      };
    }
    swaggerProperties[key] = swaggerProperty;
  }
  return {
    type: 'object',
    properties: swaggerProperties,
  };
};
