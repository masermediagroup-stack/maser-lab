export type {
  EngineMaterialId,
  ProceduralMaterialId,
  MaterialFamilyId,
  PerformanceTier,
  MaterialLayerType,
  MaterialLayer,
  MaterialSpecificParams,
  MaterialControlKey,
  MaterialDefinition,
  MaterialRecipe,
  MaterialEngineConfig,
  MaterialUniformPayload,
  CompatibilityTag,
} from "./types";
export {
  MATERIAL_INDEX,
  MAX_MATERIAL_LAYERS,
  DEFAULT_MATERIAL_PARAMS,
  DEFAULT_MATERIAL_CONFIG,
  createDefaultLayers,
  idleMaterialPayload,
} from "./types";
export {
  MATERIAL_FAMILIES,
  PROCEDURAL_MATERIALS,
  getMaterialDefinition,
  materialsByFamily,
  listReadyMaterials,
  applyMaterialDefaults,
} from "./catalog";
export { packMaterialUniforms, computeLayerBits } from "./pack";
export { MaterialController } from "./MaterialController";
export { MATERIAL_GLSL } from "./materialGlsl";
