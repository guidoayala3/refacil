import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ProductType from '@src/structures/product.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';
import { v4 as uuidv4 } from 'uuid';
const create: ValidatedEventAPIGatewayProxyEvent<ProductType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });
    const info: any = event.body as unknown as ProductType;

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

    const productsTable = table.getModel('Products');

    info.product = info.product.toUpperCase();

    if (Object.keys(info.images).length > 5) {
      return erroValidationDataResponse({
        message: `Error: supera el máximo de 5 imagenes permitidas. `,
      });
    }

    //info.currency = info.currency.toUpperCase();
    const items = await table.queryItems({ pk: `Products#Products` }, { parse: true });

    for (const item of items) {
      if (item.appUUID === info.appUUID && item.product === info.product && item.published) {
        return erroValidationDataResponse({
          message: 'Producto creado anteriormente.',
        });
      }
    }

    info.id = uuidv4();
    info.published = true;
    info.createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
    await productsTable.create(info);

    return successResponse({
      message: `Producto creado exitosamente.`,
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
