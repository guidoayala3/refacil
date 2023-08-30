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
        message: `Se requiere el id de categoría`,
      });
    }

    if (!event.pathParameters.published) {
      return erroValidationDataResponse({
        message: `Se requiere el status`,
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
    let published = true;
    if (event.pathParameters.published === 'false' || event.pathParameters.published === 'FALSE') {
      published = false;
    }
    const id = event.pathParameters.id;
    const configTable = table.getModel('Categories');
    await configTable.update(
      { pk: `Categories#Categories`, sk: `appUUID:${appUUID}#id:${id}` },
      {
        set: {
          published: published,
          updateAt: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
        },
      },
    );

    return successResponse({
      message: 'Categoría actualizada',
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: No se pudo actualizar la información de la categoría`,
    });
  }
};

export const main = middyfy(upd);
