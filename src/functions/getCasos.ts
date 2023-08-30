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

        const data = await CovidService.obtenerDatosCovid();
        if(data.length > 0){
            const result = await CovidService.procesarDatosCovid(data);
            return successResponse({
                status: true,
                result
            });
        }else{
            return successResponse({
                status: false,
                message: "No hay reporte"
            });
        }
        
    } catch (error) {
        return errorResponse({
            message: `ERROR: no se pudo obtener las categorías`,
            data: `${error.message}`,
        });
    }
};

export const main = middyfy(get);
