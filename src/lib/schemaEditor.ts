import type { JSONSchema, NewField, ObjectJSONSchema } from "../types/jsonSchema";
import { isBooleanSchema, isObjectSchema } from "../types/jsonSchema";

export type Property = {
  name: string;
  schema: JSONSchema;
  required: boolean;
};

export function copySchema<T extends JSONSchema>(schema: T): T {
  if (typeof structuredClone === "function") return structuredClone(schema);
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Updates a property in an object schema
 */
export function updateObjectProperty(
  schema: ObjectJSONSchema,
  propertyName: string,
  propertySchema: JSONSchema
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;
  
  const newSchema = copySchema(schema);
  if (!newSchema.properties) {
    newSchema.properties = {};
  }
  
  newSchema.properties[propertyName] = propertySchema;
  return newSchema;
}

/**
 * Removes a property from an object schema
 */
export function removeObjectProperty(
  schema: ObjectJSONSchema, 
  propertyName: string
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;
  
  const newSchema = copySchema(schema);
  const { [propertyName]: _, ...remainingProps } = newSchema.properties;
  newSchema.properties = remainingProps;
  
  // Also remove from required array if present
  if (newSchema.required) {
    newSchema.required = newSchema.required.filter(name => name !== propertyName);
  }
  
  return newSchema;
}

/**
 * Updates the 'required' status of a property
 */
export function updatePropertyRequired(
  schema: ObjectJSONSchema,
  propertyName: string, 
  required: boolean
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;
  
  const newSchema = copySchema(schema);
  if (!newSchema.required) {
    newSchema.required = [];
  }
  
  if (required) {
    // Add to required array if not already there
    if (!newSchema.required.includes(propertyName)) {
      newSchema.required.push(propertyName);
    }
  } else {
    // Remove from required array
    newSchema.required = newSchema.required.filter(name => name !== propertyName);
  }
  
  return newSchema;
}

/**
 * Updates an array schema's items
 */
export function updateArrayItems(
  schema: JSONSchema,
  itemsSchema: JSONSchema
): JSONSchema {
  if (typeof schema === 'boolean') return schema;
  
  const newSchema = copySchema(schema);
  if (newSchema.type === 'array') {
    newSchema.items = itemsSchema;
  }
  
  return newSchema;
}

/**
 * Creates a schema for a new field
 */
export function createFieldSchema(field: NewField): JSONSchema {
  return {
    type: field.type,
    description: field.description,
    ...field.validation,
  };
}

/**
 * Validates a field name
 */
export function validateFieldName(name: string): boolean {
  if (!name || name.trim() === '') {
    return false;
  }
  
  // Check that the name doesn't contain invalid characters for property names
  const validNamePattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  return validNamePattern.test(name);
}

/**
 * Gets properties from an object schema
 */
export function getSchemaProperties(schema: JSONSchema): Property[] {
  if (!isObjectSchema(schema) || !schema.properties) return [];
  
  const required = schema.required || [];
  
  return Object.entries(schema.properties).map(([name, propSchema]) => ({
    name,
    schema: propSchema,
    required: required.includes(name),
  }));
}

/**
 * Gets the items schema from an array schema
 */
export function getArrayItemsSchema(schema: JSONSchema): JSONSchema | null {
  if (typeof schema === 'boolean') return null;
  if (schema.type !== 'array') return null;
  
  return schema.items || null;
}

/**
 * Checks if a schema has children
 */
export function hasChildren(schema: JSONSchema): boolean {
  if (!isObjectSchema(schema)) return false;
  
  if (schema.type === "object" && schema.properties) {
    return Object.keys(schema.properties).length > 0;
  }
  
  if (schema.type === "array" && schema.items && isObjectSchema(schema.items)) {
    return schema.items.type === "object" && !!schema.items.properties;
  }
  
  return false;
}
