import { Model, ModelAttributeColumnOptions } from 'sequelize';
import { RelationAttribute } from '../models/types';
import { DateTimeHelper } from './datetime.helper';

type SwaggerProperty = {
  type?: 'string' | 'integer' | 'object';
  example?: string;
  format?: 'uuid' | 'email';
};

export const arrayOf = (model: Model) => ({
  type: 'array',
  items: swaggerRefFromModel(model),
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

export const swaggerRefFromDefinitionName = (name: string) => {
  return {
    $ref: `#/definitions/${name}`,
  };
};

export const swaggerRefFromModel = (model: Model) => {
  return swaggerRefFromDefinitionName(
    ((model as unknown) as { name: string }).name,
  );
};

const codeMap: { [code: number]: string } = {
  204: 'Success',
  302: 'Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  405: 'Method Not Allowed',
};

export function baseCodes(codes: number[]) {
  const supportedCodes = Object.keys(codeMap);
  const swaggerCodes: { [code: number]: { description: string } } = {};
  for (const code of codes) {
    if (code === 200) {
      throw Error(
        '200 codes should be associated with data; did you mean 204?',
      );
    }
    if (!supportedCodes.includes(code.toString())) {
      throw Error(
        'tried to generate a swagger response code definition for an unsupported standard code',
      );
    }
    swaggerCodes[code] = {
      description: codeMap[code],
    };
  }
  return swaggerCodes;
}

export function definitionsFromModels(models: Model[]) {
  const definitions: Record<string, SwaggerProperty> = {};
  for (const model of models) {
    definitions[
      ((model as unknown) as { name: string }).name
    ] = swaggerSchemaFromModel(model);
  }
  return definitions;
}

export function definitionsForPostBodies() {
  return {
    RegistrationBody: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        confirm_password: {
          type: 'string',
        },
      },
    },
    LoginBody: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
      },
    },
    AppointmentCreateBody: {
      type: 'object',
      properties: {
        client_profile_id: {
          type: 'string',
          required: true,
          description:
            'the id of the ClientProfile associated with this appointment',
        },
        datetime_local: {
          type: 'string',
          required: true,
          description:
            "a representation of the local time of the appointment, which must exactly match the following format: 'YYYY-MM-DD HH-MM-SS'",
          example: DateTimeHelper.formatToPureDateTime(new Date()),
        },
        duration_minutes: {
          type: 'number',
          required: true,
          description: 'the length of the appointment',
        },
        summary: {
          type: 'string',
          required: true,
          description: 'short description of the appointment',
        },
        priority: {
          type: 'string',
          required: true,
          description: 'The appointment priority, from P0 to P3',
        },
      },
    },
  };
}
