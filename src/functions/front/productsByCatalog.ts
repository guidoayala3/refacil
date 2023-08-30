import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CatalogType from '@src/structures/catalog.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';

const get: ValidatedEventAPIGatewayProxyEvent<CatalogType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const info: any = event.body;
    if (!event.pathParameters.appUUID) {
      return erroValidationDataResponse({
        message: `Se requiere el APPUUID`,
      });
    }

    if (!event.pathParameters.idCatalog) {
      return erroValidationDataResponse({
        message: `Se requiere el id de el catálogo`,
      });
    }

    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });

    const appUUID = event.pathParameters.appUUID;
    const id = event.pathParameters.idCatalog;
    const product = info.filter.toUpperCase();
    const items = await table.queryItems({ pk: `Catalog#Catalog`, sk: `appUUID:${appUUID}#id:${id}` }, { parse: true });

    let dataItems = [];
    let dataProd = [];
    for (const item of items) {
      for (const prod of item.products) {
        const itemProd = await table.queryItems(
          { pk: `Products#Products`, sk: `appUUID:${appUUID}#id:${prod}` },
          { parse: true },
        );

        const found = itemProd[0].product.includes(product);
        if (found) {
          dataProd.push(itemProd[0]);
        }
      }

      item.products = dataProd;
      dataItems.push(item);
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
