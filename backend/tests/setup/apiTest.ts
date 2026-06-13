import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import request from "supertest";
import { reportApiTest } from "./report";
import app from "../../src/app";

const CONTEXT_FILE = path.join(os.tmpdir(), 'sikosa-test-context.json');

function readStore(): Record<string, any> {
  try { return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8')); } catch { return {}; }
}

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

  const rawName = (expect as any).getState().currentTestName;
  if (rawName) {
    const testName = rawName.replace(/ > /g, ' ');
    const store = readStore();
    store[testName] = { method, url, payload, expectedStatus, actualStatus: res.status, responseBody: res.body };
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(store), 'utf-8');
  }

  return res;
};
