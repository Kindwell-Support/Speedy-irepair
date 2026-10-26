import { documentTypes } from "./documents";
import { objectTypes } from "./objects";
import { singletonTypes } from "./singletons";

export { SINGLETON_TYPES } from "./singletons";
export const schemaTypes = [...objectTypes, ...singletonTypes, ...documentTypes];
