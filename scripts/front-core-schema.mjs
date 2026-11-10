export default function frontCoreSchema() {
  return {
    id: "front-core",
    preprocessors: {
      oas3: {
        "schema-corrections": () => ({
          Root(spec) {
            // Front documents the ticket_status_update target at https://dev.frontapp.com/reference/events
            const targets =
              spec.components?.schemas?.EventResponse?.properties?.target?.properties?.data?.oneOf;
            if (!Array.isArray(targets)) {
              throw new TypeError("Expected EventResponse.target.data to contain a oneOf union");
            }
            const statusRef = "#/components/schemas/StatusResponse";
            if (!targets.some(({ $ref }) => $ref === statusRef)) {
              targets.push({ $ref: statusRef });
            }
          },
          ref(schema, { type }) {
            if (type.name !== "Schema" || schema.nullable !== true) {
              return;
            }
            // OpenAPI 3.0 ignores siblings of a reference. Express null as its own schema.
            const { $ref } = schema;
            delete schema.$ref;
            delete schema.nullable;
            schema.anyOf = [{ $ref }, { enum: [null], nullable: true, type: "string" }];
          },
        }),
      },
    },
  };
}
