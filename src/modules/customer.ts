import { getSchema } from "../utils/fn";
import { customer as customerTable } from "../db/schema";

export const moduleNameSingular = "customer";
export const moduleNamePlural = "customers";
export const module = customerTable;

export const sampleData = [
  { fieldName: "name", type: "" },
  { fieldName: "address", type: "" },
  { fieldName: "emailId", type: "" },
  { fieldName: "contactDetails", type: "" },
  { fieldName: "active", type: true },
];

export const allFieldsForAPI = [
  "name",
  "address",
  "emailId",
  "contactDetails",
  "active",
];

export const requiredFieldsForAPI = [
  "name",
  "address",
  "emailId",
  "contactDetails",
];

export const uniqueFieldsForAPI = ["name", "emailId"];

export const regexValidatedFields = [];

export const databaseFieldsForAPI = allFieldsForAPI;

export const customerSchema = getSchema({
  fields: sampleData,
});

export const generatedFieldsForAPI: {
  field: string;
  getValue: (values: any) => Promise<Exclude<any, void>> | Exclude<any, void>;
}[] = [
  {
    field: "vendor_type",
    getValue: () => 1,
  },
];

export const arrayFields = [];

const customer = {
  module,
  moduleNameSingular,
  moduleNamePlural,
  allFieldsForAPI,
  requiredFieldsForAPI,
  uniqueFieldsForAPI,
  regexValidatedFields,
  databaseFieldsForAPI,
  generatedFieldsForAPI,
  sampleData,
  arrayFields,
  orderBy: {
    field: "id",
    type: 1 as 0 | 1,
  },
  hasUpdateFields: false,
};

export default customer;
