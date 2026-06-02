// tests/helpers/report.ts

import { addMsg } from "jest-html-reporters/helper";

export const reportApi = async ({
  method,
  url,
  payload,
  response,
}: {
  method: string;
  url: string;
  payload?: any;
  response: any;
}) => {
  await addMsg({
    message: `
METHOD
${method}

URL
${url}

REQUEST
${JSON.stringify(payload, null, 2)}

RESPONSE STATUS
${response.status}

RESPONSE BODY
${JSON.stringify(response.body, null, 2)}
`,
  });
};

export async function reportApiTest(
  title: string,
  method: string,
  url: string,
  payload: unknown,
  response: any,
  expectedStatus: number
) {
  await addMsg({
    message: `
TEST CASE
${title}

REQUEST
${method} ${url}

PAYLOAD
${JSON.stringify(payload ?? {}, null, 2)}

EXPECTED
${expectedStatus}

ACTUAL
${response.status}

RESPONSE
${JSON.stringify(response.body, null, 2)}
`,
  });
}
