import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ProductType from '@src/structures/product.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const get: ValidatedEventAPIGatewayProxyEvent<ProductType> = async (
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
    const items = await table.queryItems({ pk: `Products#Products` }, { parse: true });
    let dataItems = [];
    for (const item of items) {
      if (item.appUUID === appUUID && item.published) {
        dataItems.push(item);
      }
    }
    return successResponse({
      data: dataItems,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo obtener los productos`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
