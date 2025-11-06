// DataTable.tsx
import React from "react";
import {
  ProTable,
  type ProTableProps,
  type ParamsType,
  type ActionType,
} from "@ant-design/pro-components";
import viVN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";

export type DataTableProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  U extends ParamsType = ParamsType,
  ValueType = "text"
> = ProTableProps<T, U, ValueType> & {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
};

function DataTable<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  U extends ParamsType = ParamsType,
  ValueType = "text"
>(props: DataTableProps<T, U, ValueType>) {
  return (
    <ConfigProvider locale={viVN}>
      <ProTable<T, U, ValueType> {...props} />
    </ConfigProvider>
  );
}

export default DataTable;
