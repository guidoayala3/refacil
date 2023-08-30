import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ConfigType from '@src/structures/config.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';

const get: ValidatedEventAPIGatewayProxyEvent<ConfigType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const items = await table.queryItems({ pk: `Config#Config` }, { parse: true });
    const url = event.pathParameters.url;

    for (const item of items) {
      if (item.urlKeybe === url) {
        const catalog = await table.queryItems({ pk: `Catalog#Catalog` }, { parse: true });
        let okCat = false;
        for (const cat of catalog) {
          if (cat.appUUID === item.appUUID && cat.published) {
            okCat = true;
          }
        }
        return successResponse({
          data: item,
          catalog: okCat,
        });
      }
    }

    return erroValidationDataResponse({
      message: `Información no encontrada`,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo obtener la información`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
