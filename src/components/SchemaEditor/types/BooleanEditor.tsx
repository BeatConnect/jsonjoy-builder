import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ObjectJSONSchema } from "@/types/jsonSchema";
import { isBooleanSchema, withObjectSchema } from "@/types/jsonSchema";
import { X } from "lucide-react";
import { useState } from "react";
import type { TypeEditorProps } from "../TypeEditor";

const BooleanEditor: React.FC<TypeEditorProps> = ({ schema, onChange }) => {
  const [showTrue, setShowTrue] = useState(true);
  const [showFalse, setShowFalse] = useState(true);

  // Extract boolean-specific validation
  const enumValues = withObjectSchema(
    schema,
    (s) => s.enum as boolean[] | undefined,
    null,
  );

  // Determine if we have enum restrictions
  const hasRestrictions = Array.isArray(enumValues);
  const allowsTrue = !hasRestrictions || enumValues?.includes(true) || false;
  const allowsFalse = !hasRestrictions || enumValues?.includes(false) || false;

  // Handle changing the allowed values
  const handleAllowedChange = (value: boolean, allowed: boolean) => {
    let newEnum: boolean[] | undefined;

    if (allowed) {
      // If allowing this value
      if (!hasRestrictions) {
        // No current restrictions, nothing to do
        return;
      }

      if (enumValues?.includes(value)) {
        // Already allowed, nothing to do
        return;
      }

      // Add this value to enum
      newEnum = enumValues ? [...enumValues, value] : [value];

      // If both are now allowed, we can remove the enum constraint
      if (newEnum.includes(true) && newEnum.includes(false)) {
        newEnum = undefined;
      }
    } else {
      // If disallowing this value
      if (hasRestrictions && !enumValues?.includes(value)) {
        // Already disallowed, nothing to do
        return;
      }

      // Create a new enum with just the opposite value
      newEnum = [!value];
    }

    // Update the schema
    const baseSchema = isBooleanSchema(schema)
      ? { type: "boolean" as const }
      : { ...schema };

    // Create a new validation object with just the type and enum
    const updatedValidation: ObjectJSONSchema = {
      type: "boolean",
    };

    if (newEnum) {
      updatedValidation.enum = newEnum;
    } else {
      // Remove enum property if no restrictions
      onChange({ type: "boolean" });
      return;
    }

    onChange(updatedValidation);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 pt-2">
        <Label>Allowed Values</Label>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="allow-true"
              checked={allowsTrue}
              onCheckedChange={(checked) => handleAllowedChange(true, checked)}
            />
            <Label htmlFor="allow-true" className="cursor-pointer">
              Allow true value
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow-false"
              checked={allowsFalse}
              onCheckedChange={(checked) => handleAllowedChange(false, checked)}
            />
            <Label htmlFor="allow-false" className="cursor-pointer">
              Allow false value
            </Label>
          </div>
        </div>

        {!allowsTrue && !allowsFalse && (
          <p className="text-xs text-amber-600 mt-2">
            Warning: You must allow at least one value.
          </p>
        )}
      </div>
    </div>
  );
};

export default BooleanEditor;
