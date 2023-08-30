import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import KBMicrositesSchema from 'schemes/kbMicrositesModel';
import CategoryType from '@src/structures/category.type';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';


const get: ValidatedEventAPIGatewayProxyEvent<CategoryType> = async (
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

    
    return successResponse({
      data:"OK",
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo obtener las categorías`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
