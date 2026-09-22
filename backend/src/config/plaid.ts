import {
  PlaidApi,
  PlaidEnvironments,
  Configuration,
} from "plaid";

let _plaidClient: PlaidApi | null = null;

const plaidEnvMap: Record<string, string> = {
  sandbox: PlaidEnvironments.sandbox,
  development: PlaidEnvironments.development,
  production: PlaidEnvironments.production,
};

export function getPlaidClient(): PlaidApi {
  if (_plaidClient) return _plaidClient;

  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV ?? "sandbox";

  if (!clientId || !secret) {
    throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
  }

  _plaidClient = new PlaidApi(
    new Configuration({
      basePath: plaidEnvMap[env] ?? PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    })
  );

  return _plaidClient;
}