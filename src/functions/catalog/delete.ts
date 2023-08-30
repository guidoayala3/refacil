import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CatalogType from '@src/structures/catalog.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const del: ValidatedEventAPIGatewayProxyEvent<CatalogType> = async (
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

    if (!event.pathParameters.id) {
      return erroValidationDataResponse({
        message: `Se requiere el id de el catálogo`,
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
    const id = event.pathParameters.id;
    await table.deleteItem(
      {
        pk: `Catalog#Catalog`,
        sk: `appUUID:${appUUID}#id:${id}`,
      },
      { parse: true },
    );
    return successResponse({
      message: `Información de evento eliminada exitosamente`,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};
export const main = middyfy(del);
