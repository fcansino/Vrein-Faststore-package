/**
 * Simplified override resolution for the package.
 * In a full FastStore project, this comes from src/sdk/overrides/overrides.
 * Here we provide a minimal version that resolves overrides if the consumer
 * passes them in, or returns null otherwise.
 */

export interface OverrideConfig {
  section?: string
  components?: Record<string, any>
}

export function getSectionOverrides(
  defaultComponents: Record<string, any>,
  overrideConfig?: OverrideConfig
): Record<string, any> | null {
  if (!overrideConfig?.components) return null

  const resolved: Record<string, any> = {}

  for (const [key, defaultComp] of Object.entries(defaultComponents)) {
    const override = overrideConfig.components[key]
    if (override) {
      resolved[key] = {
        Component: override.Component || override,
        props: override.props || {},
      }
    } else {
      resolved[key] = {
        Component: defaultComp,
        props: {},
      }
    }
  }

  return resolved
}
