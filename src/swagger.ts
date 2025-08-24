import { JsonObject } from "swagger-ui-express";
import { ResponseObject } from "./utils/types";

export const openApiDoc: JsonObject = {
  openapi: "3.0.1",
  info: { title: process.env.APP_NAME, version: "1.0.0" },
  paths: {},
  components: { schemas: {} },
};

export function addPath(route: string, method: string, doc: any) {
  openApiDoc.paths[route] = openApiDoc.paths[route] || {};
  openApiDoc.paths[route][method] = doc;
}

export function addSchema(module: string, schema: Record<string, any>) {
  openApiDoc.components.schemas[module] = schema;
}

export const responseCodeObjects = {
  200: ({ description, content }: ResponseObject) => ({
    description,
    content: content
      ? content
      : {
          "application/json": {
            schema: { type: "object" },
          },
        },
  }),
  201: ({ description, content }: ResponseObject) => ({
    description,
    content: content
      ? content
      : {
          "application/json": {
            schema: { type: "object" },
          },
        },
  }),
  204: ({ description }: ResponseObject) => ({
    description,
  }),
  207: ({ content }: ResponseObject) => ({
    description: "Bulk insert completed with some items failed.",
    content: content
      ? content
      : {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                inserted_count: { type: "number" },
                failed_count: { type: "number" },
                inserted_data: { type: "array", items: { type: "object" } },
                errors: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
  }),
  304: () => ({
    description: "Not modified.",
  }),
  400: () => ({
    description: "Bad Request",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  }),
  404: ({ moduleNameSingular }: ResponseObject) => ({
    description: `${moduleNameSingular} not found`,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  }),
  500: () => ({
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  }),
};
