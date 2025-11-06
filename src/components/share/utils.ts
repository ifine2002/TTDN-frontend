import { IPermission } from "@/types/backend";
import { grey, green, blue, red, orange, yellow } from "@ant-design/colors";
import groupBy from "lodash/groupBy";
import map from "lodash/map";

type TColorMethod = "POST" | "PUT" | "GET" | "DELETE" | "PATCH" | string;

export function colorMethod(method: TColorMethod) {
  switch (method) {
    case "POST":
      return green[6];
    case "PUT":
      return orange[6];
    case "GET":
      return blue[6];
    case "DELETE":
      return red[6];
    case "PATCH":
      return yellow[6];
    default:
      return grey[10];
  }
}

export const groupByPermission = (
  data: any[]
): { module: string; permissions: IPermission[] }[] => {
  const groupedData = groupBy(data, (x) => x.module);
  return map(groupedData, (value, key) => {
    return { module: key, permissions: value };
  });
};
