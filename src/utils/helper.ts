import { Request, Response } from "express";
import { query } from "../db";
import { Condition, Join } from "./types";
import crypto from "crypto";

export function md5(data: Buffer) {
  console.log(data);
  const hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("hex");
}

export const hasPermission = async (
  usePermission: boolean,
  moduleName: string,
  action: string,
  claims: {
    user_ID: number;
    permissions: { permissionId: number; title: string }[];
    roles: string;
    apps: { appId: number; appName: string }[];
  }
) => {
  if (usePermission === false) return true;
  const permissionName = `${action.toUpperCase()} ${moduleName.toUpperCase()}`;
  const userHasPermission = claims.permissions.some(
    (permission) => permission.title == permissionName
  );

  return userHasPermission;
};

export const managePermission = async (
  moduleName: string,
  action: string,
  claims: {
    user_ID: number;
    permissions: { permissionId: number; title: string }[];
    roles: string;
    apps: { appId: number; appName: string }[];
  },
  res: Response,
  usePermission?: boolean
) => {
  const isAllowed = await hasPermission(
    typeof usePermission != "undefined" ? usePermission : true,
    moduleName,
    action,
    claims
  );
  if (isAllowed) return 1;

  if (action == "create") {
    res.status(401).json({ error: "Unauthorized: Permission Denied." });
    return 0;
  }

  const isOwnAllowed = await hasPermission(
    typeof usePermission != "undefined" ? usePermission : true,
    moduleName,
    `${action} own`,
    claims
  );
  if (isOwnAllowed) return 2;

  res.status(401).json({ error: "Unauthorized: Permission Denied." });
  return 0;
};

export const fetchUserIdFromHeader = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let token_parts: {
    claims: {
      user_ID: string;
    };
  };
  try {
    token_parts = JSON.parse(atob(token.split(".")[1]));
    if (!req.body) {
      req.body = {
        claims: token_parts.claims,
      };
    } else {
      req.body.claims = token_parts.claims;
    }
    return token_parts.claims.user_ID;
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Error parsing token" });
    return;
  }
};

export const getYearAbbr = async (date: Date) => {
  const dates = await query(
    `SELECT from_date, to_date, year_abbr FROM common_master WHERE from_date IS NOT NULL AND to_date IS NOT NULL AND year_abbr IS NOT NULL;`
  );
  const start_date = new Date(date);
  for (const date of dates.rows) {
    if (
      start_date.getTime() >= new Date(date.from_date).getTime() &&
      start_date.getTime() <= new Date(date.to_date).getTime()
    ) {
      return date.year_abbr;
    }
  }
};

export const getOrderNo = async (
  values: any,
  type: "wo" | "in",
  id?: number
) => {
  if (id) return values.doc_no;

  let year_abbr = "";
  let month = 0;
  let company_abbr = "";
  let value_init = type == "wo" ? 1001 : 2001;
  let value = 0;
  const company = await query(
    `SELECT company_abbr FROM company_model LIMIT 1;`
  );
  company_abbr = company.rows[0].company_abbr;

  const date = new Date();
  year_abbr = await getYearAbbr(date);
  month = date.getMonth() + 1;

  const table = type == "wo" ? "work_order_master" : "invoice_master";
  const existing_row_count = await query(
    `SELECT COUNT(1) FROM ${table} WHERE doc_no LIKE '${year_abbr}/${month}/%' LIMIT 1;`
  );
  value = Number(existing_row_count.rows[0].count) + value_init;

  return `${year_abbr}/${month}/${company_abbr}/${type.toUpperCase()}/${value}`;
};

export function escapeSpecialChars(str: string): string {
  return str.replace(/[\'\"\\\n\t]/g, (match) => {
    switch (match) {
      case "'":
        return "\\'";
      case '"':
        return '\\"';
      case "\\":
        return "\\\\";
      case "\n":
        return "\\n";
      case "\t":
        return "\\t";
      default:
        return match;
    }
  });
}

export function parseTypes(
  values: any,
  sampleData: { fieldName: string; type: string | number | boolean | object }[]
) {
  for (const element of sampleData) {
    if (typeof element.type == "string") {
      values[element.fieldName] =
        values[element.fieldName] == "" || values[element.fieldName] == null
          ? null
          : values[element.fieldName];
    } else if (typeof element.type == "number") {
      values[element.fieldName] =
        values[element.fieldName] == "" || values[element.fieldName] == null
          ? null
          : Number(values[element.fieldName]);
    } else if (typeof element.type == "boolean") {
      values[element.fieldName] = values[element.fieldName] == true;
    }
  }
  return values;
}

export async function getPrimaryKeyFieldOfTable(name: string) {
  try {
    const table_name = escapeSpecialChars(name);
    const primary_key = await query(
      `
        SELECT c.column_name
        FROM information_schema.key_column_usage AS c
        JOIN information_schema.table_constraints AS t
            ON t.constraint_name = c.constraint_name
        WHERE t.table_name = $1
          AND t.constraint_type = 'PRIMARY KEY';
      `,
      [table_name]
    );

    if (primary_key.rows.length === 0) {
      return false;
    }

    return primary_key.rows[0].column_name;
  } catch (error) {
    return false;
  }
}

export const parseJsonParam = <T>(param: any): T | undefined => {
  if (param !== undefined) {
    const decoded = decodeURIComponent(param as string);
    // If the decoded string is "undefined", treat it as if the parameter was not provided.
    return decoded === "undefined" ? undefined : (JSON.parse(decoded) as T);
  }
  return undefined;
};

export async function getDynamicQuery(
  req: Request,
  res: Response,
  moduleNamePlural: string
) {
  const requestQuery = req.query;

  const joins: Join[] | undefined = parseJsonParam(requestQuery.joins);
  const conditions: Condition[] | undefined = parseJsonParam(
    requestQuery.conditions
  );
  const orConditions: Condition[] | undefined = parseJsonParam(
    requestQuery.orConditions
  );
  const selectedFields: string[] | undefined = parseJsonParam(
    requestQuery.selectedFields
  );

  let selectedFieldsString = "*";
  if (selectedFields && selectedFields.length > 0) {
    selectedFieldsString = selectedFields
      .map((field) => escapeSpecialChars(field))
      .join(", ");
  }

  const fields: { key: string; value: string | string[] }[] = [];
  for (const key in req.query) {
    if (
      key !== "joins" &&
      key !== "conditions" &&
      key !== "selectedFields" &&
      key !== "orConditions"
    ) {
      fields.push({ key, value: req.query[key] as string | string[] });
    }
  }

  const whereConditions: string[] = [];
  const orWhereConditions: string[] = [];

  // Add conditions derived from direct query parameters
  fields.forEach((field) => {
    whereConditions.push(
      `${escapeSpecialChars(field.key)} = '${escapeSpecialChars(
        field.value.toString()
      )}'`
    );
  });

  // Add conditions from the 'conditions' array (AND logic)
  if (conditions) {
    conditions.forEach((condition: Condition) => {
      if (condition.type === "id_match") {
        const table = escapeSpecialChars(condition.table);
        const column = escapeSpecialChars(condition.column);
        const value = escapeSpecialChars(condition.value!.toString());
        whereConditions.push(`${table}.${column} = '${value}'`);
      } else if (condition.type === "date_range") {
        const table = escapeSpecialChars(condition.table);
        const column = escapeSpecialChars(condition.column);
        const startDate = condition.start
          ? escapeSpecialChars(condition.start)
          : undefined;
        const endDate = condition.end
          ? escapeSpecialChars(condition.end)
          : undefined;

        if (startDate && endDate) {
          whereConditions.push(
            `${table}.${column} BETWEEN '${startDate}' AND '${endDate}'`
          );
        } else if (startDate) {
          whereConditions.push(`${table}.${column} >= '${startDate}'`);
        } else if (endDate) {
          whereConditions.push(`${table}.${column} <= '${endDate}'`);
        }
      } else if (condition.type == "date_range_column") {
        const table = escapeSpecialChars(condition.table);
        const date = escapeSpecialChars(condition.date);
        const startColumn = condition.startColumn
          ? escapeSpecialChars(condition.startColumn)
          : undefined;
        const endColumn = condition.endColumn
          ? escapeSpecialChars(condition.endColumn)
          : undefined;

        if (startColumn && endColumn) {
          whereConditions.push(
            `'${date}' BETWEEN ${table}.${startColumn} AND ${table}.${endColumn}`
          );
        }
      }
    });
  }

  if (orConditions) {
    orConditions.forEach((condition: Condition) => {
      if (condition.type === "id_match") {
        const table = escapeSpecialChars(condition.table);
        const column = escapeSpecialChars(condition.column);
        const value = escapeSpecialChars(condition.value!.toString());
        orWhereConditions.push(`${table}.${column} = '${value}'`);
      } else if (condition.type === "date_range") {
        const table = escapeSpecialChars(condition.table);
        const column = escapeSpecialChars(condition.column);
        const startDate = condition.start
          ? escapeSpecialChars(condition.start)
          : undefined;
        const endDate = condition.end
          ? escapeSpecialChars(condition.end)
          : undefined;

        if (startDate && endDate) {
          orWhereConditions.push(
            `${table}.${column} BETWEEN '${startDate}' AND '${endDate}'`
          );
        } else if (startDate) {
          orWhereConditions.push(`${table}.${column} >= '${startDate}'`);
        } else if (endDate) {
          orWhereConditions.push(`${table}.${column} <= '${endDate}'`);
        }
      } else if (condition.type == "date_range_column") {
        const table = escapeSpecialChars(condition.table);
        const date = escapeSpecialChars(condition.date);
        const startColumn = condition.startColumn
          ? escapeSpecialChars(condition.startColumn)
          : undefined;
        const endColumn = condition.endColumn
          ? escapeSpecialChars(condition.endColumn)
          : undefined;

        if (startColumn && endColumn) {
          orWhereConditions.push(
            `'${date}' BETWEEN ${table}.${startColumn} AND ${table}.${endColumn}`
          );
        }
      }
    });
  }

  let fromClause = escapeSpecialChars(moduleNamePlural);

  if (joins && joins.length > 0) {
    joins.forEach((join: Join) => {
      const joinType = escapeSpecialChars(join.type);
      const fromT = escapeSpecialChars(join.fromTable);
      const fromC = escapeSpecialChars(join.fromColumn);
      const toT = escapeSpecialChars(join.toTable);
      const toC = escapeSpecialChars(join.toColumn);

      fromClause += ` ${joinType} ${toT} ON ${fromT}.${fromC} = ${toT}.${toC}`;
    });
  }

  // --- Construct the WHERE clause ---
  let whereClause = "";
  if (whereConditions.length > 0) {
    whereClause = whereConditions.join(" AND ");
  }

  // Construct the OR WHERE clause (will be grouped with AND conditions if both exist)
  let orWhereClause = "";
  if (orWhereConditions.length > 0) {
    orWhereClause = orWhereConditions.join(" OR ");
  }

  let finalWhereClause = "";
  if (whereClause && orWhereClause) {
    finalWhereClause = `(${whereClause}) AND (${orWhereClause})`;
  } else if (whereClause) {
    finalWhereClause = whereClause;
  } else if (orWhereClause) {
    finalWhereClause = orWhereClause;
  }

  return [selectedFieldsString, fromClause, finalWhereClause];
}
