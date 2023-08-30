import 'source-map-support/register';
import middyfy from '@libs/lambda';
import { errorResponse, Response, successResponse, erroValidationDataResponse } from 'src/common/apiResponses';
import authV5 from '@libs/authV5';
import AWS, { S3 } from 'aws-sdk';
const s3 = new AWS.S3();
import md5 from 'crypto-js/md5';
const parser = require('lambda-multipart-parser');

const upload = async (event) => {
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

    const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
    dataInfo.archivo = md5(fecha).toString() + '-' + dataInfo.files[0].filename;
    const destino = process.env.STAGE + '/' + dataInfo.appUUID + '/' + dataInfo.archivo;

    let urlImg = '';
    const options = {
      Bucket: process.env.S3Bucket,
      Key: destino,
      Body: Buffer.from(dataInfo.files[0].content),
      ContentType: dataInfo.files[0].contentType,
    };

    const uploadFile = await s3.upload(options).promise();
    urlImg = uploadFile.Location;

    return successResponse({
      url: urlImg,
    });
  } catch (error) {
    return errorResponse({
      message: `ERROR: ${error.message}`,
    });
  }
};

export const main = middyfy(upload);
