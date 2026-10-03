import type { components, operations } from "./gen/schema.gen";
import type { operationRoutes } from "./gen/operation-routes.gen";
import type { PaginationInfo, WithNormalizedPagination } from "./normalize-response";

type OperationName = keyof typeof operationRoutes & keyof operations;
type ParametersFor<Name extends OperationName> = operations[Name]["parameters"];
type QueryFor<Name extends OperationName> =
  ParametersFor<Name> extends { query?: infer Query } ? NonNullable<Query> : never;
type Field<Key extends string, Value> = [Value] extends [never]
  ? { [K in Key]?: never }
  : { [K in Key]: Value };
type PathFor<Name extends OperationName> =
  ParametersFor<Name> extends { path: infer Path } ? Path : never;
type RequestBodyFor<Name extends OperationName> = NonNullable<operations[Name]["requestBody"]>;
type SchemaBodyFor<Name extends OperationName> = [RequestBodyFor<Name>] extends [never]
  ? never
  : RequestBodyFor<Name> extends { content: { "application/json": infer Body } }
    ? Body
    : never;
// Front's spec includes this component but omits it from the PATCH operation.
type BodyFor<Name extends OperationName> = Name extends "update-message-template"
  ? components["schemas"]["UpdateMessageTemplate"]
  : Name extends "update-a-tag"
    ? Omit<SchemaBodyFor<Name>, "parent_tag_id"> & { parent_tag_id?: string | null }
    : SchemaBodyFor<Name>;
type SupportsPagination<Name extends OperationName> = [QueryFor<Name>] extends [never]
  ? false
  : "page_token" extends keyof QueryFor<Name>
    ? true
    : false;
type PaginationFor<Name extends OperationName> =
  SupportsPagination<Name> extends true ? { nextPageUrl?: string } : { nextPageUrl?: never };

type BodyField<Name extends OperationName> = Name extends "update-message-template"
  ? Field<"body", BodyFor<Name>>
  : operations[Name] extends { requestBody: unknown }
    ? Field<"body", BodyFor<Name>>
    : { body?: BodyFor<Name> };
export type OperationListParams<Name extends OperationName> = QueryFor<Name> & PaginationFor<Name>;
export type OperationParams<Name extends OperationName> = Field<"path", PathFor<Name>> &
  BodyField<Name> & { query?: QueryFor<Name> } & PaginationFor<Name>;
type SuccessResponse<Name extends OperationName> = Name extends OperationName
  ? operations[Name]["responses"][Extract<
      keyof operations[Name]["responses"],
      200 | 201 | 202 | 204
    >]
  : never;
type ResponseBody<Response> = Response extends { content: { "application/json": infer Body } }
  ? Body
  : ReturnType<() => void>;
export type OperationResponse<Name extends OperationName> = Name extends OperationName
  ? WithNormalizedPagination<ResponseBody<SuccessResponse<Name>>> &
      (SupportsPagination<Name> extends true ? { pagination?: PaginationInfo } : unknown)
  : never;
type RequiredKeys<T> = { [K in keyof T]-?: undefined extends T[K] ? never : K }[keyof T];
export type OperationArgs<Name extends OperationName> = [
  RequiredKeys<OperationParams<Name>>,
] extends [never]
  ? [params?: OperationParams<Name>]
  : [params: OperationParams<Name>];

export type RawOperationName = {
  [Name in OperationName]: (typeof operationRoutes)[Name]["method"] extends "GET"
    ? [QueryFor<Name> | BodyFor<Name>] extends [never]
      ? Name
      : never
    : never;
}[OperationName];
