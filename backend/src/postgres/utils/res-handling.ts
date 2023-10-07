import { QueryResult } from 'pg';
export const rowAsData = (row: any) => row && { id: row.id, ...row.data };
export const rowAsSecretData = (row: any) => row && { id: row.id, ...row.secret };
export const rowAsDataAndSecret = (row: any) => row && { id: row.id, ...row.data, ...row.secret };
export const rowAsDataAndPassword = (row: any) =>
  row && {
    id: row.id,
    password: row.secret.password,
    ...row.data,
  };
export const rowsAsData = (rows: any[]) => rows && rows.map(rowAsData);
export const getFirstElementOrNull = (res: QueryResult) => {
  if (res && res.rows && res.rows.length > 0) {
    return res.rows.shift();
  }
  return null;
};
