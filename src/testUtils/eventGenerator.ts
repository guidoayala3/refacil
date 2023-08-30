export const eventGenerator = ({
  body,
  method = null,
  path = '',
  queryStringObject = null,
  pathParametersObject = null,
  stageVariables = null,
}) => {
  const request = {
    body: body || null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: method,
    isBase64Encoded: false,
    path,
    pathParameters: pathParametersObject,
    queryStringParameters: queryStringObject,
    multiValueQueryStringParameters: null,
    stageVariables,
    requestContext: {
      accountId: '',
      apiId: '',
      httpMethod: method,
      identity: {
        accessKey: '',
        accountId: '',
        apiKey: '',
        apiKeyId: '',
        caller: '',
        cognitoAuthenticationProvider: '',
        cognitoAuthenticationType: '',
        cognitoIdentityId: '',
        cognitoIdentityPoolId: '',
        principalOrgId: '',
        sourceIp: '',
        user: '',
        userAgent: '',
        userArn: '',
      },
      path,
      stage: '',
      requestId: '',
      requestTimeEpoch: 3,
      resourceId: '',
      resourcePath: '',
    },
    resource: '',
  };
  return request;
};
