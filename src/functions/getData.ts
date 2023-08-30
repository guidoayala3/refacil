import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import middyfy from '@libs/lambda';
import CasosType from '@src/structures/casos.type';
import dbService from '../common/dbService';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import CovidService from "../services/covidServices";

async function getCasosCovid(): Promise<CasosType[]> {
  const query = 'SELECT * FROM casos_covid';
  const casos: CasosType[] = await dbService.query(query);
  return casos;
}


const get: ValidatedEventAPIGatewayProxyEvent<CasosType> = async (
  event: AWSLambda.APIGatewayEvent,
): Promise<Response> => {
  try {
    
    const data = await CovidService.checkAndInsertCovidCases();
    
    return successResponse({
      data,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: no se pudo obtener información`,
      data: `${error.message}`,
    });
  }
};

export const main = middyfy(get);
