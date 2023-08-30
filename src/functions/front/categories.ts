import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CategoryType from '@src/structures/category.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';

const get: ValidatedEventAPIGatewayProxyEvent<CategoryType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const appUUID = event.pathParameters.appUUID;
    const items = await table.queryItems({ pk: `Categories#Categories` }, { parse: true });
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
      message: `ERROR: no se pudo obtener las categorías`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
