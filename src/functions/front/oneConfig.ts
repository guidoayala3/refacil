import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ConfigType from '@src/structures/config.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const get: ValidatedEventAPIGatewayProxyEvent<ConfigType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    /*if (!event.headers.Authorization) {
      return erroValidationDataResponse({
        message: `Se requiere TOKEN`,
      });
    }*/

    if (!event.pathParameters.appUUID) {
      return erroValidationDataResponse({
        message: `Se requiere el APPUUID`,
      });
    }

    /*if (!(await authV5(event.headers.Authorization, event.pathParameters.appUUID))) {
      return erroValidationDataResponse({
        message: `Error: No esta autorizado`,
      });
    }*/

    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const appUUID = event.pathParameters.appUUID;
    const item = await table.queryItems({ pk: `Config#Config`, sk: `appUUID:${appUUID}` }, { parse: true });
    if (Object.keys(item).length === 0) {
      return erroValidationDataResponse({
        message: `No hay configuración disponible`,
      });
    }
    const catalog = await table.queryItems({ pk: `Catalog#Catalog` }, { parse: true });
    let okCat = false;
    for (const cat of catalog) {
      if (cat.appUUID === item[0].appUUID && cat.published) {
        okCat = true;
      }
    }

    return successResponse({
      catalog: okCat,
      data: item,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo obtener la información`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
