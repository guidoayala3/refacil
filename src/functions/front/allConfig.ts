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

    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const items = await table.queryItems({ pk: `Config#Config` }, { parse: true });
    let dataItems = [];
    for (const item of items) {
      if (item.published) {
        dataItems.push(item);
      }
    }

    return successResponse({
      data: dataItems,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no s epudo obtener la información`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
