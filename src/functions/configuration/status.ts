import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ConfigType from '@src/structures/config.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const upd: ValidatedEventAPIGatewayProxyEvent<ConfigType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    if (!event.headers.Authorization) {
      return erroValidationDataResponse({
        message: `Se requiere TOKEN`,
      });
    }

    if (!event.pathParameters.appUUID) {
      return erroValidationDataResponse({
        message: `Se requiere el APPUUID`,
      });
    }

    if (!event.pathParameters.published) {
      return erroValidationDataResponse({
        message: `Se requiere el status`,
      });
    }

    if (!(await authV5(event.headers.Authorization, event.pathParameters.appUUID))) {
      return erroValidationDataResponse({
        message: `Error: No esta autorizado`,
      });
    }

    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const appUUID = event.pathParameters.appUUID;
    let published = true;
    if (event.pathParameters.published === 'false' || event.pathParameters.published === 'FALSE') {
      published = false;
    }
    const items = await table.queryItems({ pk: `Config#Config`, sk: `appUUID:${appUUID}` }, { parse: true });
    const configTable = table.getModel('Config');
    for (const item of items) {
      if (item.appUUID === appUUID) {
        await configTable.update(
          { pk: `Config#Config`, sk: `appUUID:${appUUID}` },
          {
            set: {
              published: published,
              updateAt: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
            },
          },
        );

        return successResponse({
          message: 'Configuración actualizada',
        });
      }
    }
    return erroValidationDataResponse({
      message: `Configuración no encontrada`,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(upd);
