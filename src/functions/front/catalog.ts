import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CatalogType from '@src/structures/catalog.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const get: ValidatedEventAPIGatewayProxyEvent<CatalogType> = async (
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

    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const appUUID = event.pathParameters.appUUID;
    const items = await table.queryItems({ pk: `Catalog#Catalog` }, { parse: true });
    let dataItems = [];
    let dataProd = [];
    for (const item of items) {
      if (item.appUUID === appUUID && item.published) {
        if (Array.isArray(item.products)) {
          for (const prod of item.products) {
            const itemProd = await table.queryItems(
              { pk: `Products#Products`, sk: `appUUID:${appUUID}#id:${prod}` },
              { parse: true },
            );
            dataProd.push(itemProd[0]);
          }
          item.products = dataProd;
          dataItems.push(item);
        }
      }
    }

    return successResponse({
      data: dataItems,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo obtener el catálogo`,
      data: `${error.message}`,
    });
  }
};
export const main = middyfy(get);
