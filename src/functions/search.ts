import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import CasosType from '@src/structures/casos.type';
import { errorResponse, Response, successResponse } from 'src/common/apiResponses';
import CovidService from "../services/covidServices";



interface QueryParameters {
    genero?: string;
    estado?: string;
    ciudad?: string;
  }

const get: ValidatedEventAPIGatewayProxyEvent<CasosType> = async (
    event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
    try {

        const queryParameters = event.queryStringParameters || {};

    const filter: QueryParameters = {};
    if (queryParameters.genero) filter.genero = queryParameters.genero;
    if (queryParameters.ciudad) filter.ciudad = queryParameters.ciudad;
    if (queryParameters.estado) filter.estado = queryParameters.estado;

    const casosIds = await CovidService.getFilteredCasosIds(filter);

    return successResponse({
      data: {
        idsDeCaso: casosIds,
      },
    });

    } catch (error) {
        return errorResponse({
            message: `ERROR: no se pudo obtener información`,
            data: `${error.message}`,
        });
    }
};

export const main = middyfy(get);
