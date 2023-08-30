import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CategoryType from '@src/structures/category.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const upd: ValidatedEventAPIGatewayProxyEvent<CategoryType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const info: any = event.body as unknown as CategoryType;
    if (!event.headers.Authorization) {
      return erroValidationDataResponse({
        message: `Se requiere TOKEN`,
      });
    }

    if (!info.appUUID) {
      return erroValidationDataResponse({
        message: `Se requiere el APPUUID`,
      });
    }

    if (!(await authV5(event.headers.Authorization, info.appUUID))) {
      return erroValidationDataResponse({
        message: `Error: No esta autorizado`,
      });
    }

    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });
    const categoryTable = table.getModel('Categories');

    const items = await table.queryItems({ pk: `Categories#Categories` }, { parse: true });
    // info.category = info.category.toUpperCase();
    for (const item of items) {
      if (item.category === info.category && item.appUUID === info.appUUID && item.id !== info.id) {
        return erroValidationDataResponse({
          message: `Categoría registrada anteriormente`,
        });
      }
    }

    for (const item of items) {
      if (item.appUUID === info.appUUID && item.id === info.id) {
        await categoryTable.update(
          { pk: `Categories#Categories`, sk: `appUUID:${info.appUUID}#id:${info.id}` },
          {
            set: {
              category: info.category,
              published: info.published,
              updateAt: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
            },
          },
        );

        return successResponse({
          message: 'Categoría actualizada',
        });
      }
    }
    return erroValidationDataResponse({
      message: `Categoría no encontrada`,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(upd);
