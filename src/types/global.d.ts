declare module "*.mp4" {
  export default string;
}

declare module "*.png" {
  export default string;
}

declare module "*.xlsx" {
  export default string;
}

declare module "*.xlsm" {
  export default string;
}

declare module "*.csv" {
  export default string;
}

declare module "react-icons/*";

declare module "uuid";

declare module "lodash";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.styl" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  export interface AxiosResponse<T = any> extends Promise<T> {}
}
