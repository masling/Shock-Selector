import { z } from "zod";

export const scenarioEntryKeySchema = z.enum([
  "linear_free_motion",
  "linear_force_driven",
  "linear_motor_driven",
  "linear_cylinder_driven",
  "rotary_motion",
]);

export const scenarioFamilyKeySchema = z.enum([
  "linear_free_motion",
  "linear_force_driven",
  "linear_motor_driven",
  "linear_cylinder_driven",
  "rotary_load",
  "rotary_beam_or_gate",
  "rotary_table",
]);

export const motionKindSchema = z.enum(["LINEAR", "ROTARY"]);
export const orientationSchema = z.enum(["HORIZONTAL", "VERTICAL", "SLOPE"]);
export const driveTypeSchema = z.enum(["FREE", "FORCE", "MOTOR", "CYLINDER"]);
export const loadTypeSchema = z.enum(["OBJECT", "LOAD", "BEAM_OR_GATE", "TABLE"]);
export const gravityRelationSchema = z.enum(["NONE", "ASSISTING", "OPPOSING"]);

const queryBooleanSchema = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

export const scenarioCatalogQuerySchema = z.object({
  entryKey: scenarioEntryKeySchema.optional(),
  familyKey: scenarioFamilyKeySchema.optional(),
  motionKind: motionKindSchema.optional(),
  implementedOnly: queryBooleanSchema,
});

export type ScenarioEntryKey = z.infer<typeof scenarioEntryKeySchema>;
export type ScenarioFamilyKey = z.infer<typeof scenarioFamilyKeySchema>;
export type MotionKindValue = z.infer<typeof motionKindSchema>;
export type OrientationValue = z.infer<typeof orientationSchema>;
export type LoadTypeValue = z.infer<typeof loadTypeSchema>;
export type GravityRelationValue = z.infer<typeof gravityRelationSchema>;
export type ScenarioCatalogQueryInput = z.infer<typeof scenarioCatalogQuerySchema>;
