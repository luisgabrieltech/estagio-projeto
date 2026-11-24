/**
 * Common metrics types
 * 
 * Generic types for metrics and analytics that can be reused across features
 * 
 * @module types/common/metrics
 */

/**
 * Generic date-based metric data point
 * 
 * @example
 * ```typescript
 * const metric: DateMetric = {
 *   date: '2024-01-15',
 *   value: 42,
 *   cumulative: 150
 * }
 * ```
 */
export interface DateMetric {
  /** Date string in ISO format or localized format */
  date: string
  /** Value for this date */
  value: number
  /** Cumulative value up to this date (optional) */
  cumulative?: number
}

/**
 * Generic timeline data point for charts
 * 
 * @example
 * ```typescript
 * const point: TimelineDataPoint = {
 *   date: '2024-01-15',
 *   responses: 10,
 *   cumulative: 50
 * }
 * ```
 */
export interface TimelineDataPoint {
  /** Date string */
  date: string
  /** Number of responses/items for this date */
  responses: number
  /** Cumulative count up to this date */
  cumulative: number
}

/**
 * Generic distribution item for statistical analysis
 * 
 * @example
 * ```typescript
 * const item: DistributionItem = {
 *   label: 'Option A',
 *   count: 25,
 *   percentage: 50.0
 * }
 * ```
 */
export interface DistributionItem {
  /** Label or name of the item */
  label: string
  /** Count of occurrences */
  count: number
  /** Percentage of total */
  percentage: number
}

/**
 * Generic option statistics for multiple choice questions
 * 
 * @example
 * ```typescript
 * const stat: OptionStat = {
 *   option: 'Very Satisfied',
 *   count: 45,
 *   percentage: 45.0
 * }
 * ```
 */
export interface OptionStat {
  /** Option text */
  option: string
  /** Number of times selected */
  count: number
  /** Percentage of total responses */
  percentage: number
}

/**
 * Generic scale statistics for numerical scale questions
 * 
 * @example
 * ```typescript
 * const stats: ScaleStats = {
 *   average: 4.2,
 *   median: 4,
 *   mode: 5,
 *   standardDeviation: 0.8,
 *   distribution: [...]
 * }
 * ```
 */
export interface ScaleStats {
  /** Average value */
  average: number
  /** Median value */
  median: number
  /** Most common value */
  mode: number
  /** Standard deviation */
  standardDeviation: number
  /** Distribution of values */
  distribution: Array<{
    value: number
    count: number
    percentage: number
  }>
}

/**
 * Generic text analysis results
 * 
 * @example
 * ```typescript
 * const analysis: TextAnalysis = {
 *   averageLength: 150,
 *   totalWords: 5000,
 *   uniqueWords: 800,
 *   wordCloud: [...]
 * }
 * ```
 */
export interface TextAnalysis {
  /** Average character length of responses */
  averageLength: number
  /** Total word count across all responses */
  totalWords: number
  /** Number of unique words */
  uniqueWords: number
  /** Word frequency data for word cloud */
  wordCloud: Array<{
    word: string
    frequency: number
    weight: number
  }>
  /** Common phrases found in responses */
  commonPhrases?: Array<{
    phrase: string
    count: number
  }>
  /** Sentiment analysis results (optional) */
  sentimentAnalysis?: {
    positive: number
    neutral: number
    negative: number
  }
}

/**
 * Generic grid statistics for matrix/grid questions
 * 
 * @example
 * ```typescript
 * const stats: GridStats = {
 *   rowStats: [...],
 *   columnTotals: [...]
 * }
 * ```
 */
export interface GridStats {
  /** Statistics for each row */
  rowStats: Array<{
    rowLabel: string
    responses: Array<{
      column: string
      count: number
      percentage: number
    }>
  }>
  /** Total counts for each column */
  columnTotals: Array<{
    column: string
    total: number
    percentage: number
  }>
}

/**
 * Generic demographic breakdown
 * 
 * @example
 * ```typescript
 * const breakdown: DemographicBreakdown = {
 *   segment: 'Campus A',
 *   count: 150,
 *   percentage: 30.0
 * }
 * ```
 */
export interface DemographicBreakdown {
  /** Segment name (campus, course, role, etc.) */
  segment: string
  /** Count for this segment */
  count: number
  /** Percentage of total */
  percentage: number
}

/**
 * Generic overview metrics
 * 
 * @example
 * ```typescript
 * const overview: OverviewMetrics = {
 *   total: 500,
 *   rate: 75.5,
 *   average: 12.3,
 *   completionRate: 92.0
 * }
 * ```
 */
export interface OverviewMetrics {
  /** Total count */
  total: number
  /** Rate percentage */
  rate: number
  /** Average value */
  average: number
  /** Completion rate percentage */
  completionRate: number
}

/**
 * Generic chart data structure
 * 
 * @example
 * ```typescript
 * const chartData: ChartDataset = {
 *   labels: ['Jan', 'Feb', 'Mar'],
 *   datasets: [{
 *     label: 'Responses',
 *     data: [10, 20, 30]
 *   }]
 * }
 * ```
 */
export interface ChartDataset {
  /** Labels for x-axis or categories */
  labels: string[]
  /** Data series */
  datasets: Array<{
    /** Series label */
    label: string
    /** Data values */
    data: number[]
    /** Background colors (optional) */
    backgroundColor?: string[]
    /** Border colors (optional) */
    borderColor?: string[]
    /** Border width (optional) */
    borderWidth?: number
  }>
}

/**
 * Generic word cloud data item
 * 
 * @example
 * ```typescript
 * const word: WordCloudItem = {
 *   text: 'excellent',
 *   size: 24,
 *   color: '#3B82F6'
 * }
 * ```
 */
export interface WordCloudItem {
  /** Word text */
  text: string
  /** Size/weight of the word */
  size: number
  /** Color for display (optional) */
  color?: string
}

/**
 * Generic trend analysis data
 * 
 * @example
 * ```typescript
 * const trend: TrendData = {
 *   direction: 'increasing',
 *   changePercent: 15.5,
 *   periods: [...]
 * }
 * ```
 */
export interface TrendData {
  /** Trend direction */
  direction: 'increasing' | 'decreasing' | 'stable'
  /** Percentage change */
  changePercent: number
  /** Period-by-period data */
  periods: Array<{
    period: string
    value: number
    change?: number
  }>
}

/**
 * Generic comparison data between segments
 * 
 * @example
 * ```typescript
 * const comparison: SegmentComparison = {
 *   segment: 'Campus A',
 *   segmentType: 'campus',
 *   current: 100,
 *   previous: 80,
 *   change: 25.0
 * }
 * ```
 */
export interface SegmentComparison {
  /** Segment name */
  segment: string
  /** Type of segment */
  segmentType: string
  /** Current period value */
  current: number
  /** Previous period value */
  previous: number
  /** Percentage change */
  change: number
}
