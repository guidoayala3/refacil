import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CategoryType from '@src/structures/category.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';
import { v4 as uuidv4 } from 'uuid';
const create: ValidatedEventAPIGatewayProxyEvent<CategoryType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const table = new Table({
      client,
      name: process.env.KBTABLE,
      schema: KBMicrositesSchema,
    });
    const info: any = event.body as unknown as CategoryType;

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

    const categoryTable = table.getModel('Categories');

    //info.category = info.category.toUpperCase();
    const items = await table.queryItems({ pk: `Categories#Categories` }, { parse: true });

    for (const item of items) {
      if (item.appUUID === info.appUUID && item.category === info.category) {
        return erroValidationDataResponse({
          message: 'Categoría registrada anteriormente',
        });
      }
    }

    info.id = uuidv4();
    info.published = true;
    info.createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
    await categoryTable.create(info);

    return successResponse({
      message: `Categoría creada exitosamente.`,
      data: {
        id: info.id,
        category: info.category,
      },
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(create);
