import request from "supertest";
import { reportApiTest } from "./report";
import app from "../../src/app";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const apiTest = async ({
  id,
  method,
  url,
  payload,
  expectedStatus,
}: {
  id: string;
  method: Method;
  url: string;
  payload?: any;
  expectedStatus: number;
}) => {
  let res;

  switch (method) {
    case "POST":
      res = await request(app).post(url).send(payload);
      break;
    case "GET":
      res = await request(app).get(url);
      break;
    case "PUT":
      res = await request(app).put(url).send(payload);
      break;
    case "PATCH":
      res = await request(app).patch(url).send(payload);
      break;
    case "DELETE":
      res = await request(app).delete(url);
      break;
  }

  await reportApiTest(id, method, url, payload, res, expectedStatus);

  return res;
};
