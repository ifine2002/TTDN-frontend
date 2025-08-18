import { grey, green, blue, red, orange, yellow } from '@ant-design/colors';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';

export function colorMethod(method) {
    switch (method) {
        case "POST":
            return green[6]
        case "PUT":
            return orange[6]
        case "GET":
            return blue[6]
        case "DELETE":
            return red[6]
        case "PATCH":
            return yellow[6]
        default:
            return grey[10];
    }
}

export const groupByPermission = (data) => {
    const groupedData = groupBy(data, x => x.module);
    return map(groupedData, (value, key) => {
        return { module: key, permissions: value };
    });
}