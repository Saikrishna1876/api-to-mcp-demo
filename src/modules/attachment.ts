import { getSchema } from "../utils/fn";
import { attachment as attachmentTable } from "../db/schema";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { ModuleParams } from "../utils/types";

export const moduleNameSingular = "attachment";
export const moduleNamePlural = "attachments";
export const module = attachmentTable;

export const createUploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(
        __dirname,
        `../../${process.env.UPLOAD_PATH}`
      );
      mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const sampleData = [
  { fieldName: "rowId", type: 0 },
  { fieldName: "moduleName", type: "" },
];

export const allFieldsForAPI = ["rowId", "moduleName"];

export const requiredFieldsForAPI = ["rowId", "moduleName"];

export const uniqueFieldsForAPI = [];

export const regexValidatedFields = [];

export const databaseFieldsForAPI = allFieldsForAPI;

export const attachmentSchema = getSchema({
  fields: sampleData,
});

export const generatedFieldsForAPI: ModuleParams["generatedFieldsForAPI"] = [];

const attachment = {
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
  dependentField: ["row_id", "module_name"],
  hasUpdateFields: false,
  usePermission: false,
};

export default attachment;
