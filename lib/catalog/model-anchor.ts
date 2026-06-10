export function getModelAnchorId(model: string) {
  return `model-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
