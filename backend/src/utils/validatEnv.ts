import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env, {
  MONGO_CONNECTION_STRING: str(),
  APP_ORIGIN: str(),
  PORT: port(),
});
