import type {
  AnalyticsComboPoint,
  AnalyticsDonutSegment,
  AnalyticsKpiMetric,
  AnalyticsStackedPoint,
  AnalyticsStackedSeries,
  AnalyticsStateValue,
  AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'

export type AnalyticsMainChartConfig =
  | {
      id: string
      type: 'area-line'
      metric: AnalyticsKpiMetric
      data: AnalyticsTimeSeriesPoint[]
      yAxisLabel?: string
      valueFormatter?: (value: number) => string
    }
  | {
      id: string
      type: 'combo'
      metric: AnalyticsKpiMetric
      data: AnalyticsComboPoint[]
    }

export type AnalyticsDonutChartConfig = {
  id: string
  title: string
  data: AnalyticsDonutSegment[]
}

export type AnalyticsStackedChartConfig = {
  title?: string
  data: AnalyticsStackedPoint[]
  series: AnalyticsStackedSeries[]
  yAxisFormatter?: (value: number) => string
}

export type AnalyticsFilterOption = {
  id: string
  label: string
  value: string
  options: string[]
}

export type AnalyticsFilterBarConfig = {
  periodChips: string[]
  activePeriod?: string
  dateRangeLabel: string
  filters: AnalyticsFilterOption[]
}

export type AnalyticsSparklineCard = AnalyticsKpiMetric & {
  sparkline: AnalyticsTimeSeriesPoint[]
}

export type AnalyticsDashboardConfig = {
  kpiMetrics: AnalyticsKpiMetric[]
  mainCharts: AnalyticsMainChartConfig[]
  breakdownDonuts: AnalyticsDonutChartConfig[]
  geographicSection: {
    title: string
    filters: AnalyticsFilterBarConfig
    mapCard: {
      title: string
      states: AnalyticsStateValue[]
    }
    sideChart: AnalyticsStackedChartConfig & { title: string }
  }
  performanceSection: {
    stackedArea: AnalyticsStackedChartConfig & { title: string }
    summaryCards: AnalyticsSparklineCard[]
  }
}
