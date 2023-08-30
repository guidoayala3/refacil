import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CatalogType from '@src/structures/catalog.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';
import { v4 as uuidv4 } from 'uuid';
const create: ValidatedEventAPIGatewayProxyEvent<CatalogType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });
    const info: any = event.body as unknown as CatalogType;

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

    const catalogTable = table.getModel('Catalogs');

    const items = await table.queryItems({ pk: `Catalog#Catalog` }, { parse: true });

    for (const item of items) {
      if (item.published && item.appUUID === info.appUUID) {
        return erroValidationDataResponse({
          message: `Error: no puede crear otro catálogo mientras este alguno activo.`,
        });
      }
    }

    info.id = uuidv4();
    info.published = true;
    info.createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
    await catalogTable.create(info);

    return successResponse({
      message: `Catálogo creado exitosamente.`,
      data: info,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(create);
