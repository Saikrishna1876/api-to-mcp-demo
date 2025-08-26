import { Response } from "express";
import { query } from "../db";

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
