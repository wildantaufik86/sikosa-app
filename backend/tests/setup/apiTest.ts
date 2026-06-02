import request from "supertest";
import { reportApiTest } from "./report";
import app from "../../src/app";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const apiTest = async ({
  id,
  method,
  url,
  payload,
  headers,
  expectedStatus,
}: {
  id: string;
  method: Method;
  url: string;
  payload?: any;
  headers?: Record<string, string>;
  expectedStatus: number;
}) => {
  let req: ReturnType<typeof request.prototype.get>;

  switch (method) {
    case "POST":
      req = request(app).post(url);
      break;
    case "GET":
      req = request(app).get(url);
      break;
    case "PUT":
      req = request(app).put(url);
      break;
    case "PATCH":
      req = request(app).patch(url);
      break;
    case "DELETE":
      req = request(app).delete(url);
      break;
  }

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      req = req.set(key, value);
    });
  }

  if (payload !== undefined) {
    req = (req as any).send(payload);
  }

  const res = await req;

  await reportApiTest(id, method, url, payload, res, expectedStatus);

  return res;
};
