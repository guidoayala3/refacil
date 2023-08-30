import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import ConfigType from '@src/structures/config.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import { Table } from 'dynamodb-onetable';
import client from '@libs/dynamoDBORM';
import authV5 from '@libs/authV5';

const upd: ValidatedEventAPIGatewayProxyEvent<ConfigType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    const info: any = event.body as unknown as ConfigType;
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
    const configTable = table.getModel('Config');

    const items = await table.queryItems({ pk: `Config#Config` }, { parse: true });
    for (const item of items) {
      if (item.urlKeybe === info.urlKeybe && item.appUUID !== info.appUUID) {
        return erroValidationDataResponse({
          message: `URL utilizada en otro micrositio`,
        });
      }
    }

    await configTable.update(
      { pk: `Config#Config`, sk: `appUUID:${info.appUUID}` },
      {
        set: {
          name: info.name,
          photoProfile: info.photoProfile,
          background: info.background,
          address: info.address,
          webSite: info.webSite,
          urlKeybe: info.urlKeybe,
          whatsappKeybe: info.whatsappKeybe,
          socialLinks: info.socialLinks,
          published: info.published,
          updateAt: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
        },
      },
    );

    return successResponse({
      message: 'Configuración actualizada',
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo realizar el proceso`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(upd);
