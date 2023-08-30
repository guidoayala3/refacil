import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import CasosType from '@src/structures/casos.type';
import { errorResponse, Response, successResponse } from 'src/common/apiResponses';
import CovidService from "../services/covidServices";





const get: ValidatedEventAPIGatewayProxyEvent<CasosType> = async (
    event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
    try {

        if (event.pathParameters.genero) {
            let genero = event.pathParameters.genero
          }

          if (event.pathParameters.ciudad) {
            let genero = event.pathParameters.genero
          }

          if (event.pathParameters.estado) {
            let genero = event.pathParameters.genero
          }
          
        
        
    } catch (error) {
        return errorResponse({
            message: `ERROR: no se pudo obtener las categorías`,
            data: `${error.message}`,
        });
    }
};

export const main = middyfy(get);
