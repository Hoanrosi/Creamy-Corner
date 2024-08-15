export const HttpStatusCode = {
  badRequest: 400,
  unauthorized: 401,
  accessTokenExpire: 401,
  refreshTokenExpire: 401,
  invalidCredentials: 401,
  invalidRefreshToken: 401,
  forbidden: 403,
  notFound: 404,
  dataExisted: 400,
  invalidIncomingData: 400,
  created: 201,
};

export const ErrorCode = {
  UNAUTHORIZED: "AA_UE_001",
  ACCESS_TOKEN_EXPIRE: "AA_UE_002",
  REFRESH_TOKEN_EXPIRE: "AA_UE_003",
  INVALID_CREDENTIALS: "AA_UE_004",
  INVALID_REFRESH_TOKEN: "AA_UE_005",
  INVALID_OR_EXPIRE_TOKEN: "AA_UE_006",
  FORBIDDEN: "AA_FE_001",
  BAD_REQUEST: "AA_BRE_001",
  NOT_FOUND: "AA_BRE_002",
  DATA_EXISTED: "AA_BRE_003",
  INVALID_INCOMING_DATA: "AA_BRE_004",
  INTERNAL_SERVER_ERROR: "AA_ISE_001",
};
