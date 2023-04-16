import { Response } from "express";

declare global {
  type MediaType =
    | "html"
    | "css"
    | "scss"
    | "ts"
    | "js"
    | "txt"
    | "pic"
    | "json";

  type MediaDescripitor = {
    path: string;
    diskPath: string;
    mediaType: MediaType;
  };

  type ServerOptions = {
    resolveDiskPath: (res: Response) => string;
    isBootReq: (path: string) => boolean;
  };
}
