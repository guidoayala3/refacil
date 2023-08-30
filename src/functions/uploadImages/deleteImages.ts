import 'source-map-support/register';
import middyfy from '@libs/lambda';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import authV5 from '@libs/authV5';
import AWS, { S3 } from 'aws-sdk';
const s3 = new AWS.S3();
const parser = require('lambda-multipart-parser');

const deleted = async (event: AWSLambda.APIGatewayEvent): Promise<Response> => {
  try {
    const dataInfo = await parser.parse(event);

    if (!event.headers.Authorization) {
      return erroValidationDataResponse({
        message: `Se requiere TOKEN`,
      });
    }

    if (!dataInfo.appUUID) {
      return erroValidationDataResponse({
        message: `Se requiere identificadores`,
      });
    }

    if (!(await authV5(event.headers.Authorization, dataInfo.appUUID))) {
      return erroValidationDataResponse({
        message: `Error: No esta autorizado`,
      });
    }
    const destino = process.env.STAGE + '/' + dataInfo.appUUID + '/' + dataInfo.urlImage;

    const options = {
      Bucket: process.env.S3Bucket,
      Key: destino,
    };
    await s3.deleteObject(options).promise();

    return successResponse({
      msj: 'imagen eliminada',
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: ${error.message}`,
    });
  }
};

export const main = middyfy(deleted);
