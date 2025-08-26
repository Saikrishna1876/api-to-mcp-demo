import * as schemas from "../db/schema";

export type Module = (typeof schemas)[keyof typeof schemas];

export type ModuleParams = {
  module: Module;
  moduleNameSingular: string;
  moduleNamePlural: string;
  allFieldsForAPI: string[];
  databaseFieldsForAPI: string[];
  requiredFieldsForAPI: string[];
  uniqueFieldsForAPI: string[];
  regexValidatedFields: {
    field: string;
    pattern: RegExp;
    errorMessage: string;
  }[];
  generatedFieldsForAPI: {
    field: string;
    getValue: (
      values: any,
      id?: number
    ) => Promise<Exclude<any, void>> | Exclude<any, void>;
  }[];
  sampleData: {
    fieldName: string;
    type: string | number | boolean | object;
  }[];
  orderBy?: { field: string; type: 0 | 1 };
  arrayFields?: { fieldName: string; type: string }[];
  dependentField?: string | string[];
  moduleMasterTableName?: string;
  hasUpdateFields?: boolean;
  preDeleteValidation?: (values: any) => Promise<{ error: string } | true>;
  usePermission?: boolean;
};

export type ErrorObject = {
  description?: string;
  content?: {
    [key: string]: object;
  };
};

export type ResponseObject = Partial<ModuleParams> & ErrorObject;

export type Tool = {};

/*
{
  openapi: '3.0.1',
  info: { title: 'api-to-mcp-demo', version: '1.0.0' },
  paths: {
    '/customer/api/customers/multiple': { post: [Object] },
    '/customer/api/customers': { get: [Object], post: [Object] },
    '/customer/api/customers/{id}': { get: [Object], put: [Object], delete: [Object] },
    '/attachment/api/attachments/tran': { get: [Object] },
    '/attachment/api/attachments/{id}': { put: [Object], delete: [Object] },
    '/attachment/api/attachments/{row_id}/{module_name}': { post: [Object] }
  },
  components: { schemas: { customers: [Object], attachments: [Object] } }
}
*/
