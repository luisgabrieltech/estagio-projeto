/**
 * Chart Colors Configuration
 * 
 * Centralized color palette for charts and visualizations.
 * 
 * @module lib/config/chart-colors
 */

/**
 * Default color palette for charts
 */
export const CHART_COLORS = [
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884D8', // Purple
  '#82CA9D', // Green
  '#FFC658', // Gold
  '#FF7C7C', // Red
  '#8DD1E1', // Cyan
  '#D084D0', // Pink
] as const

/**
 * Semantic colors for specific use cases
 */
export const SEMANTIC_COLORS = {
  success: '#00C49F',
  warning: '#FFBB28',
  error: '#FF7C7C',
  info: '#0088FE',
  neutral: '#8884D8',
} as const

/**
 * UPE brand colors
 */
export const UPE_COLORS = {
  blue: '#003366',
  red: '#CC0000',
  lightBlue: '#0066CC',
} as const

/**
 * Get color by index with cycling
 * 
 * @param index - Index to get color for
 * @returns Color string
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

/**
 * Generate gradient colors between two colors
 * 
 * @param startColor - Starting color
 * @param endColor - Ending color
 * @param steps - Number of steps
 * @returns Array of color strings
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const colors: string[] = []
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    colors.push(interpolateColor(startColor, endColor, ratio))
  }
  
  return colors
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex = (color: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }
  
  const c1 = hex(color1)
  const c2 = hex(color2)
  
  const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio)
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
