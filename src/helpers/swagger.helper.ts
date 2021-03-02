type SwaggerProperty = {
  type?: 'string' | 'integer';
  example?: string;
  format?: 'uuid' | 'email';
};

export const sequelizeModelToSwaggerSchema = (model: any) => {
  const swaggerProperties: Record<string, SwaggerProperty> = {};
  for (const key in model.rawAttributes) {
    const swaggerProperty: SwaggerProperty = {};
    if (model.rawAttributes[key].primaryKey) {
      swaggerProperties[key] = {
        type: 'string',
        format: 'uuid',
      };
      continue;
    }
    try {
      const typeString = model.rawAttributes[key].type.toString();
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
          swaggerProperty.type =
            model.rawAttributes[key].swaggerType || 'string';
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
