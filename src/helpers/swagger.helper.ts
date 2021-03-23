import { DataTypes, Model } from 'sequelize';
import {
  PermissionedModelAttributeColumnOptions,
  RelationAttribute,
} from '../models/_prototypes';

type SwaggerProperty = {
  $ref?: string;
  type?: 'string' | 'integer' | 'object' | 'boolean';
  example?: string;
  format?: 'uuid' | 'email';
  enum?: readonly string[];
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
    rawAttributes: {
      [attribute: string]: PermissionedModelAttributeColumnOptions;
    };
  };
  for (const key in rawAttributes) {
    if (!rawAttributes[key].visible) {
      // Skip attributes that will never be permissioned for the client
      continue;
    }
    swaggerProperties[key] = swaggerPropertyFromAttribute(rawAttributes[key]);
  }
  return {
    type: 'object',
    properties: swaggerProperties,
  } as SwaggerProperty;
};

const swaggerPropertyFromVirtual = (
  attribute: PermissionedModelAttributeColumnOptions,
) => {
  if ((attribute as RelationAttribute).model) {
    return swaggerRefFromModel((attribute as RelationAttribute).model);
  }
  if (attribute.swagger_type) {
    return {
      type: attribute.swagger_type,
    };
  }
  if (
    (attribute as PermissionedModelAttributeColumnOptions)
      .swagger_definition_name
  ) {
    return swaggerRefFromDefinitionName(
      (attribute as PermissionedModelAttributeColumnOptions)
        .swagger_definition_name as string,
    );
  }
  return { type: 'string' } as SwaggerProperty;
};

export const swaggerPropertyFromAttribute = (
  attribute: PermissionedModelAttributeColumnOptions,
) => {
  let swaggerProperty: SwaggerProperty = {};
  if (attribute.primaryKey) {
    return {
      type: 'string',
      format: 'uuid',
    } as SwaggerProperty;
  }
  // Enums have to be handled as a special case, serializing the type with .toString() throws an error
  if (attribute.type instanceof DataTypes.ENUM) {
    return {
      type: 'string',
      enum: attribute.values,
    } as SwaggerProperty;
  }
  try {
    const typeString = attribute.type.toString({});
    switch (typeString) {
      case 'VARCHAR(255)':
        swaggerProperty.type = 'string';
        break;
      case 'TINYINT(1)':
        swaggerProperty.type = 'boolean';
        break;
      case 'NUMBER':
        swaggerProperty.type = 'integer';
        break;
      case 'DATETIME':
        swaggerProperty.type = 'string';
        break;
      case 'VIRTUAL':
        swaggerProperty = swaggerPropertyFromVirtual(attribute);
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
  409: 'Conflict',
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

// eslint-disable-next-line sonarjs/cognitive-complexity
function assignSchemaByMethod(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  swaggerJson: any,
  pathKey: string,
  method: 'post' | 'put',
) {
  const { paths } = swaggerJson;
  const path = paths[pathKey];
  const postConfig = path[method];
  const { parameters } = postConfig;
  if (!parameters) {
    return;
  }
  for (const parameter of parameters) {
    if (parameter.in === 'body') {
      const pathParts = pathKey
        .split('/')
        .reduce((flatParts, currentStr) => {
          currentStr.split('_').forEach((item) => flatParts.push(item));
          return flatParts;
        }, [] as string[])
        .reduce((flatParts, currentStr) => {
          currentStr.split(/{.*}/).forEach((item) => flatParts.push(item));
          return flatParts;
        }, [] as string[]);
      let postBodyDefinitionName = '';
      for (const part of pathParts) {
        if (part === 'api') {
          continue;
        }
        if (part.length) {
          postBodyDefinitionName += part.replace(/^./, part[0].toUpperCase());
        }
      }
      postBodyDefinitionName += method === 'post' ? 'PostBody' : 'PutBody';
      if (parameter.schema.$ref) {
        // Oop, looks like we've already post-processed this json and it's been cached.
        continue;
      }
      const postBody = { ...parameter.schema };
      swaggerJson.definitions[postBodyDefinitionName] = postBody;
      parameter.schema = { $ref: '#/definitions/' + postBodyDefinitionName };
    }
  }
}

// This function post-processes the generated swagger-json to move
// any 'inline' POST body parameter schemas into named definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function moveInlinePostBodiesToDefinitions(swaggerJson: any) {
  const { paths } = swaggerJson;
  const pathKeys = Object.keys(paths);
  for (const pathKey of pathKeys) {
    const path = paths[pathKey];
    if (path.post) {
      assignSchemaByMethod(swaggerJson, pathKey, 'post');
    }
    if (path.put) {
      assignSchemaByMethod(swaggerJson, pathKey, 'put');
    }
  }
  return swaggerJson;
}
