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

export type Condition =
  | {
      type: "id_match";
      table: string;
      column: string;
      value: string;
    }
  | {
      type: "date_range";
      table: string;
      column: string;
      start: string;
      end: string;
    }
  | {
      type: "date_range_column";
      table: string;
      date: string;
      startColumn: string;
      endColumn: string;
    };

export interface Join {
  type: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN" | "FULL OUTER JOIN";
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}
