import serverless from "serverless-http";
import { createApp } from "../../server/_core/index";

let handlerInstance: any;

export const handler = async (event: any, context: any) => {
  if (!handlerInstance) {
    const { app } = await createApp();
    handlerInstance = serverless(app);
  }
  return handlerInstance(event, context);
};
