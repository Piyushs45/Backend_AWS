import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

import { Auth_Header } from "./helper";

/**
 * Basic Lambda Authorizer function for API Gateway.
 * Validates Basic Auth credentials against environment variables.
 */
export async function basicAuthorizer(
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  const authHeader = event.authorizationToken;

  function UnauthorizedError() {
  const error = new Error("Unauthorized");
  (error as any).statusCode = 401;
  throw error;
}

  // Check if Authorization header is present and starts with "Basic "
  if (!authHeader || !authHeader.startsWith(Auth_Header )) {
    throw UnauthorizedError();
  }

  try {
    // Extract and decode credentials
    const encodedCredentials = authHeader.split(" ")[1];
    const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf-8");

    const [username, password] = decodedCredentials.split(":");

    // Validate credentials against environment variable
    const expectedPassword = process.env[username];

    if (expectedPassword !== password) {
      return generatePolicy("user", "Deny", event.methodArn);
    }

    // Credentials are valid
    return generatePolicy(username, "Allow", event.methodArn);
  } catch (error) {
    // Defensive fallback in case of malformed header
    return generatePolicy("user", "Deny", event.methodArn);
  }
}

/**
 * Helper function to generate IAM policy
 */
function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
