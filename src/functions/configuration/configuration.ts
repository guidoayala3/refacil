import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ConfigType from '@src/structures/config.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';
import { v4 as uuidv4 } from 'uuid';
const create: ValidatedEventAPIGatewayProxyEvent<ConfigType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });
    const info: any = event.body as unknown as ConfigType;
    const configTable = table.getModel('Config');

    if (!event.headers.Authorization) {
      return erroValidationDataResponse({
        message: `Se requiere TOKEN`,
      });
    }

    if (!(await authV5(event.headers.Authorization, info.appUUID))) {
      return erroValidationDataResponse({
        message: `Error: No esta autorizado`,
      });
    }

    const validate = await table.queryItems({ pk: `Config#Config`, sk: `appUUID:${info.appUUID}` }, { parse: true });

    if (Object.keys(validate).length > 0) {
      return erroValidationDataResponse({
        message: `Ya tiene una configuración creada debe actualizar datos`,
      });
    }

    const items = await table.queryItems({ pk: `Config#Config` }, { parse: true });
    for (const item of items) {
      if (item.urlKeybe === info.urlKeybe && item.appUUID !== info.appUUID) {
        return erroValidationDataResponse({
          message: `URL utilizada en otro micrositio`,
        });
      }
    }

    info.id = uuidv4();
    info.published = true;
    info.createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });

    await configTable.create(info);

    return successResponse({
      message: `Configración creada exitosamente.`,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(create);
