import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { parse } from "json2csv";
import { parseTypes } from "./helper";
import { and, asc, count, desc, eq, ne, sql } from "drizzle-orm";
import * as schemas from "../db/schema";
import { PgColumn } from "drizzle-orm/pg-core";
import { addPath, responseCodeObjects } from "../swagger";
import { Module, ModuleParams } from "./types";

/**
 * Used for generating schema of the model in swagger ui
 */
export const getSchema = ({
  fields,
}: {
  fields: { fieldName: string; type: string | number | boolean | object }[];
}) => {
  return {
    type: "object",
    properties: fields.reduce((acc, field) => {
      acc[field.fieldName] = { type: typeof field.type };
      return acc;
    }, {} as Record<string, { type: string }>),
  };
};

export const createMultiple = ({
  module,
  moduleNameSingular,
  moduleNamePlural,
  requiredFieldsForAPI,
  uniqueFieldsForAPI,
  databaseFieldsForAPI,
  regexValidatedFields,
}: ModuleParams) => {
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}/multiple`, "post", {
    summary: `Create multiple ${moduleNameSingular} records`,
    tags: [moduleNamePlural],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: databaseFieldsForAPI.reduce((acc, field) => {
                acc[field] = { type: "string" }; // Placeholder type, can be refined
                return acc;
              }, {} as Record<string, { type: string }>),
              required: requiredFieldsForAPI,
            },
          },
        },
      },
    },
    responses: {
      "201": responseCodeObjects[201]({
        description: `Successfully created multiple ${moduleNameSingular} records`,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                inserted_count: { type: "number" },
                inserted_data: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      }),
      "207": responseCodeObjects[207]({}),
      "400": responseCodeObjects[400](),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data_to_insert: any[] = req.body;

      if (!Array.isArray(data_to_insert) || data_to_insert.length === 0) {
        res.status(400).json({
          error: `Request body must be a non-empty array of ${moduleNamePlural}`,
        });
      }

      const inserted_data = [];
      const errors: { index: number; error: string; fields: string[] }[] = [];

      for (let i = 0; i < data_to_insert.length; i++) {
        const data = data_to_insert[i];
        const missingFields = requiredFieldsForAPI.filter(
          (field) => data[field] === undefined || data[field] === null
        );

        if (
          data.added_by &&
          (data.added_by == null ||
            data.added_by == undefined ||
            data.added_by == "")
        ) {
          missingFields.push("added_by");
        }

        if (missingFields.length > 0) {
          errors.push({
            index: i,
            error: `Missing required fields: ${missingFields.join(", ")}`,
            fields: missingFields,
          });
          continue;
        }

        // Validator
        for (const { field, pattern, errorMessage } of regexValidatedFields) {
          if (
            data[field] !== undefined &&
            data[field] !== null &&
            !pattern.test(data[field])
          ) {
            res.status(400).json({ error: errorMessage, fields: [field] });
            return;
          }
        }

        // Unique fields check
        let uniqueFieldConflict = false;
        for (const field of uniqueFieldsForAPI) {
          if (data[field]) {
            const existing_row = await db
              .select({ count: count() })
              .from(module)
              .where(
                eq(module[field as keyof Module[keyof Module]], data[field])
              );
            if (existing_row[0].count > 0) {
              errors.push({
                index: i,
                error: `${field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())} '${
                  data[field]
                }' already exists`,
                fields: [field],
              });
              uniqueFieldConflict = true;
            }
          }
        }
        if (uniqueFieldConflict) {
          continue;
        }

        try {
          const insertValues: Record<string, any> = {};
          for (const field of databaseFieldsForAPI) {
            insertValues[field] = data[field];
          }
          insertValues.addedBy = data.added_by;
          insertValues.addDate = new Date();
          insertValues.updatedBy = data.updated_by || null;
          insertValues.updateDate = new Date();

          const result = await db
            .insert(module)
            .values(insertValues)
            .returning();
          inserted_data.push(result[0]);
        } catch (insert_error: any) {
          console.error(
            `Error inserting ${moduleNameSingular} at index ${i}:`,
            insert_error.message
          );
          errors.push({ index: i, error: insert_error.message, fields: [] });
        }
      }

      if (errors.length > 0) {
        res.status(207).json({
          message: "Bulk insert completed with some items failed.",
          inserted_count: inserted_data.length,
          failed_count: errors.length,
          inserted_data: inserted_data,
          errors: errors,
        });
      }

      res.status(201).json({
        message: `All ${moduleNamePlural} inserted successfully!`,
        inserted_count: inserted_data.length,
        inserted_data: inserted_data,
      });
    } catch (error: any) {
      console.error(`Error processing multiple ${moduleNamePlural}:`, error);
      next(error);
    }
  };
};

export const createOne = ({
  module,
  moduleNameSingular,
  moduleNamePlural,
  databaseFieldsForAPI,
  requiredFieldsForAPI,
  uniqueFieldsForAPI,
  regexValidatedFields,
  generatedFieldsForAPI,
  sampleData,
}: ModuleParams) => {
  // Add this block
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}`, "post", {
    summary: `Create a single ${moduleNameSingular} record`,
    tags: [moduleNamePlural],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: sampleData.reduce((acc, field) => {
              acc[field.fieldName] = { type: typeof field.type };
              return acc;
            }, {} as Record<string, { type: string }>),
            required: requiredFieldsForAPI,
          },
        },
      },
    },
    responses: {
      "201": responseCodeObjects[201]({
        description: `Successfully created a ${moduleNameSingular} record`,
        content: {
          "application/json": {
            schema: {
              type: "object", // Assuming the response is the created object
              properties: databaseFieldsForAPI.reduce((acc, field) => {
                acc[field] = { type: "string" }; // Placeholder type
                return acc;
              }, {} as Record<string, { type: string }>),
            },
          },
        },
      }),
      "400": responseCodeObjects[400](),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const init_data = req.body;
      const { user } = init_data;
      const data = parseTypes(init_data, sampleData);

      const missingFields = requiredFieldsForAPI.filter(
        (field) => data[field] === undefined || data[field] === null
      );

      if (missingFields.length > 0) {
        res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Validator
      for (const { field, pattern, errorMessage } of regexValidatedFields) {
        if (
          data[field] !== undefined &&
          data[field] !== null &&
          !pattern.test(data[field])
        ) {
          res.status(400).json({ error: errorMessage, fields: [field] });
          return;
        }
      }

      // Unique fields check
      for (const field of uniqueFieldsForAPI) {
        if (data[field]) {
          const existing_row = await db
            .select({ count: count() })
            .from(module)
            .where(
              eq(module[field as keyof typeof module] as PgColumn, data[field])
            );
          if (existing_row[0].count > 0) {
            res.status(400).json({
              error: `${field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())} already exists`,
            });
            return;
          }
        }
      }

      // Generated fields
      for (const { field, getValue } of generatedFieldsForAPI) {
        try {
          data[field] = await getValue(data);
        } catch (error: Error | any) {
          res.status(400).json({ error: error.message, fields: [field] });
          return;
        }
      }

      const valuesD: Record<string, any> = {};

      for (const field of databaseFieldsForAPI) {
        if (data[field] === undefined || data[field] === null) continue;
        valuesD[field] = data[field];
      }

      const res2 = await db.insert(module).values(valuesD).returning();
      res.status(201).json(res2[0]);
    } catch (error: any) {
      console.error(`Error creating ${moduleNameSingular}:`, error);
      next(error);
    }
  };
};

export const exportModule = ({
  module,
  moduleNameSingular,
  moduleNamePlural,
  allFieldsForAPI,
}: ModuleParams) => {
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}/export`, "get", {
    summary: `Export ${moduleNameSingular} records`,
    tags: [moduleNamePlural],
    parameters: [
      {
        name: "format",
        in: "query",
        description: "Export format (json or csv)",
        required: false,
        schema: {
          type: "string",
          enum: ["json", "csv"],
          default: "json",
        },
      },
    ],
    responses: {
      "200": responseCodeObjects[200]({
        description: `Successfully exported ${moduleNameSingular} records`,
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object", // Placeholder type
              },
            },
          },
          "text/csv": {
            schema: {
              type: "string",
            },
          },
        },
      }),
      "204": responseCodeObjects[204]({
        description: "No content to export",
      }),
      "400": {
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
      },
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = (req.query.format as string) || "json";

      let queryBuilder = db.select().from(module).$dynamic();

      const result = await queryBuilder;
      const data = result;

      if (data.length === 0) {
        res.status(204).send();
      }

      if (format.toLowerCase() === "csv") {
        const fields = allFieldsForAPI.filter((field) => field !== "active");
        const csv = parse(data, { fields });
        res.header("Content-Type", "text/csv");
        res.attachment(`${moduleNamePlural}_export.csv`);
        res.send(csv);
      } else if (format.toLowerCase() === "json") {
        res.header("Content-Type", "application/json");
        res.attachment(`${moduleNamePlural}_export.json`);
        res.json(data);
      } else {
        res.status(400).json({
          error: "Invalid format specified. Supported formats: 'json', 'csv'.",
        });
      }
    } catch (error: any) {
      console.error(`Error exporting ${moduleNamePlural}:`, error);
      next(error);
    }
  };
};

export const getAll = ({
  module,
  moduleNamePlural,
  moduleNameSingular,
  orderBy,
}: ModuleParams) => {
  // Add this block
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}`, "get", {
    summary: `Get all ${moduleNameSingular} records`,
    tags: [moduleNamePlural],
    responses: {
      "200": responseCodeObjects[200]({
        description: `Successfully retrieved all ${moduleNameSingular} records`,
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object", // Placeholder type
              },
            },
          },
        },
      }),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exe_query = db.select().from(module);
      if (orderBy) {
        exe_query.orderBy(
          orderBy.type == 1
            ? desc(module[orderBy.field as keyof Module[keyof Module]])
            : asc(module[orderBy.field as keyof Module[keyof Module]])
        );
      }

      const result = await exe_query;
      res.json(result);
    } catch (error: any) {
      console.error(`Error fetching ${moduleNamePlural}:`, error);
      next(error);
    }
  };
};

// This is incomplete, thinking of removing it.
export const getAllTran = ({
  module,
  moduleNamePlural,
  moduleNameSingular,
  dependentField,
  orderBy,
  moduleMasterTableName,
}: ModuleParams) => {
  // Add this block
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}/tran`, "get", {
    summary: `Get all transactional ${moduleNameSingular} records`,
    tags: [moduleNamePlural],
    responses: {
      "200": responseCodeObjects[200]({
        description: `Successfully retrieved all transactional ${moduleNameSingular} records`,
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object", // Placeholder type
              },
            },
          },
        },
      }),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exe_query = db.select().from(module);
      if (orderBy) {
        exe_query.orderBy(
          orderBy.type == 1
            ? desc(module[orderBy.field as keyof Module[keyof Module]])
            : asc(module[orderBy.field as keyof Module[keyof Module]])
        );
      }
      const result = await exe_query;
      res.json(result);
    } catch (error: any) {
      console.error(`Error fetching ${moduleNamePlural}:`, error);
      next(error);
    }
  };
};

export const getOne = ({
  module,
  moduleNamePlural,
  moduleNameSingular,
}: ModuleParams) => {
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}/{id}`, "get", {
    summary: `Get a single ${moduleNameSingular} record by ID`,
    tags: [moduleNamePlural],
    parameters: [
      {
        name: "id",
        in: "path",
        description: `ID of the ${moduleNameSingular} record to retrieve`,
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      "200": responseCodeObjects[200]({
        description: `Successfully retrieved ${moduleNameSingular} record`,
        content: {
          "application/json": {
            schema: {
              type: "object", // Placeholder type
            },
          },
        },
      }),
      "404": responseCodeObjects[404]({
        description: `${moduleNameSingular} not found`,
      }),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row_id = req.params.id;
      const exe_query = db
        .select()
        .from(module)
        .where(eq(module.id, Number(row_id)))
        .limit(1);
      const result = await exe_query;
      if (result.length == 0) {
        res.status(404).json({ error: `${moduleNameSingular} not found` });
        return;
      }
      res.json(result[0]);
    } catch (error: any) {
      console.error(`Error fetching ${moduleNameSingular} by ID:`, error);
      next(error);
    }
  };
};

export const updateOne = ({
  module,
  moduleNamePlural,
  moduleNameSingular,
  uniqueFieldsForAPI,
  databaseFieldsForAPI,
  hasUpdateFields = true,
  regexValidatedFields,
  generatedFieldsForAPI,
  sampleData,
  arrayFields,
}: ModuleParams) => {
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}/{id}`, "put", {
    summary: `Update a single ${moduleNameSingular} record by ID`,
    tags: [moduleNamePlural],
    parameters: [
      {
        name: "id",
        in: "path",
        description: `ID of the ${moduleNameSingular} record to update`,
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: sampleData.reduce((acc, field) => {
              acc[field.fieldName] = { type: typeof field.type };
              return acc;
            }, {} as Record<string, { type: string }>),
          },
        },
      },
    },
    responses: {
      "200": responseCodeObjects[200]({
        description: `Successfully updated ${moduleNameSingular} record`,
        content: {
          "application/json": {
            schema: {
              type: "object", // Placeholder type
            },
          },
        },
      }),
      "304": responseCodeObjects[304](),
      "400": responseCodeObjects[400](),
      "404": responseCodeObjects[404]({
        description: `${moduleNameSingular} not found`,
      }),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row_id = req.params.id;

      const existing_row_result = await db
        .select({ count: count() })
        .from(module);
      if (existing_row_result[0].count === 0) {
        res.status(404).json({ error: `${moduleNameSingular} not found` });
        return;
      }

      const init_data_to_update = req.body;
      const { user } = init_data_to_update;
      const data_to_update = parseTypes(init_data_to_update, sampleData);

      // Validator
      for (const { field, pattern, errorMessage } of regexValidatedFields) {
        if (
          data_to_update[field] !== undefined &&
          data_to_update[field] !== null &&
          !pattern.test(data_to_update[field])
        ) {
          res.status(400).json({ error: errorMessage, fields: [field] });
          return; // Return immediately on regex validation failure
        }
      }

      // Unique fields
      for (const field of uniqueFieldsForAPI) {
        if (data_to_update[field]) {
          const existing_row = await db
            .select({ count: count() })
            .from(module)
            .where(
              and(
                eq(
                  module[field as keyof Module[keyof Module]],
                  data_to_update[field]
                ),
                ne(module.id, Number(row_id))
              )
            );
          if (existing_row[0].count > 0) {
            res.status(400).json({
              error: `${field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())} already exists`,
            });
            return;
          }
        }
      }

      // Generated fields
      for (const { field, getValue } of generatedFieldsForAPI) {
        try {
          data_to_update[field] = await getValue(
            data_to_update,
            Number(row_id)
          );
        } catch (error: Error | any) {
          res.status(400).json({ error: error.message, fields: [field] });
          return;
        }
      }

      const updateValues: Record<string, any> = {};
      // Dynamically build updates based on databaseFieldsForAPI and provided data
      for (const field of databaseFieldsForAPI) {
        if (data_to_update[field] == undefined) continue;
        updateValues[field] = data_to_update[field];
      }
      if (hasUpdateFields) {
        updateValues.updatedBy = user.id;
        updateValues.updatedDate = new Date();
      }

      if (Object.keys(updateValues).length === 0) {
        res.status(304).json({ message: "No fields to update" });
        return;
      }

      const result = await db
        .update(module)
        .set(updateValues)
        .where(eq(module.id, Number(row_id)))
        .returning();

      if (result.length === 0) {
        res.status(404).json({
          error: `${moduleNameSingular} not found after update attempt`,
        });
        return;
      }
      res.json(result[0]);
    } catch (error: any) {
      console.error(`Error updating ${moduleNameSingular}:`, error);
      next(error);
    }
  };
};

export const softDelete = ({
  module,
  moduleNamePlural,
  moduleNameSingular,
  preDeleteValidation,
}: ModuleParams) => {
  addPath(`/${moduleNameSingular}/api/${moduleNamePlural}/{id}`, "delete", {
    summary: `Soft delete a single ${moduleNameSingular} record by ID`,
    tags: [moduleNamePlural],
    parameters: [
      {
        name: "id",
        in: "path",
        description: `ID of the ${moduleNameSingular} record to soft delete`,
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      "204": responseCodeObjects[204]({
        description: `Successfully soft deleted ${moduleNameSingular} record`,
      }),
      "400": responseCodeObjects[400](),
      "404": responseCodeObjects[404]({
        description: `${moduleNameSingular} not found`,
      }),
      "500": responseCodeObjects[500](),
    },
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row_id = Number(req.params.id);
      const row = await db
        .select()
        .from(module)
        .where(eq(module.id, row_id))
        .limit(1);
      if (row.length === 0) {
        res.status(404).json({ error: `${moduleNameSingular} not found` });
        return;
      }
      if (preDeleteValidation) {
        const validate = await preDeleteValidation(row);
        if (validate != true) {
          res.status(400).json(validate);
          return;
        }
      }

      const result = await db
        .update(module)
        .set({ active: sql`FALSE` })
        .where(eq(module.id as PgColumn, Number(row_id)))
        .returning();
      if (result.length === 0) {
        res.status(404).json({ error: `${moduleNameSingular} not found` });
      }
      res.status(204).send("File deleted successfully");
    } catch (error: any) {
      console.error(`Error deleting ${moduleNameSingular}:`, error);
      next(error);
    }
  };
};

// Specific for attachment module.
export const registerFiles = ({
  moduleNameSingular,
  moduleNamePlural,
}: ModuleParams) => {
  addPath(
    `/${moduleNameSingular}/api/${moduleNamePlural}/{row_id}/{module_name}`,
    "post",
    {
      summary: `Register files for a ${moduleNamePlural} record`,
      tags: [moduleNamePlural],
      parameters: [
        {
          name: "row_id",
          in: "path",
          description: `ID of the ${moduleNamePlural} record`,
          required: true,
          schema: {
            type: "integer",
          },
        },
        {
          name: "module_name",
          in: "path",
          description: `Name of the module`,
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                files: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "200": responseCodeObjects[200]({
          description: "Files registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  files: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        }),
        "400": responseCodeObjects[404]({ moduleNameSingular }),
        "500": {
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
        },
      },
    }
  );

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const row_id = Number(req.params.row_id);
      const module_name = req.params.module_name;

      if (!row_id || !module_name) {
        res.status(400).json({ error: "Row ID and module name are required" });
        return;
      }

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
      }
      /**
       * Note: file.location is only available on third party storage solutions, you get the filename from the file object when using diskStorage
       */
      const values = files.map((file) => ({
        rowId: row_id,
        moduleName: module_name,
        filePath: `/${process.env.UPLOAD_PATH}/${file.filename}`,
      }));

      await db.insert(schemas.attachment).values(values);

      res.status(200).json({
        message: `${files.length} file(s) registered successfully.`,
        files: files.map((f) => f.filename),
      });
      return;
    } catch (error: any) {
      console.error(
        `Error processing multiple ${moduleNamePlural} files:`,
        error
      );
      next(error);
    }
  };
};
