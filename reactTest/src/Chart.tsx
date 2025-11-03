import React, { useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartData, DataPoint } from './WebSocketClient';

export interface ChartProps {
  chart: ChartData;
  theme?: 'light' | 'dark';
  onDataExport?: (data: DataPoint[]) => void;
  height?: string;
}

const Chart: React.FC<ChartProps> = ({ chart, theme = 'light', onDataExport, height = '400px' }) => {
  const chartRef = useRef<ReactECharts | null>(null);

  // 根据图表类型和数据生成ECharts配置
  const chartOption = useMemo(() => {
    const isDark = theme === 'dark';
    const baseConfig = {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      textStyle: {
        color: isDark ? '#ffffff' : '#333333'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: isDark ? '#ffffff' : '#333333'
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: isDark ? '#6a6a6a' : '#cccccc'
          }
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {
            pixelRatio: 2,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
          },
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {}
        },
        iconStyle: {
          borderColor: isDark ? '#ffffff' : '#333333'
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomLock: false
        },
        {
          start: 0,
          end: 100,
          handleStyle: {
            color: isDark ? '#4a4a4a' : '#ccc',
            shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      ]
    };

    switch (chart.type) {
      case 'line':
        return {
          ...baseConfig,
          xAxis: {
            type: 'time',
            axisLabel: {
              formatter: '{HH}:{mm}:{ss}',
              color: isDark ? '#cccccc' : '#666666'
            },
            axisLine: {
              lineStyle: {
                color: isDark ? '#4a4a4a' : '#e0e0e0'
              }
            },
            splitLine: {
              lineStyle: {
                color: isDark ? '#333333' : '#f0f0f0'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: isDark ? '#cccccc' : '#666666'
            },
            axisLine: {
              lineStyle: {
                color: isDark ? '#4a4a4a' : '#e0e0e0'
              }
            },
            splitLine: {
              lineStyle: {
                color: isDark ? '#333333' : '#f0f0f0'
              }
            }
          },
          series: [
            {
              name: chart.name,
              type: 'line',
              data: chart.data.map((item) => [item.timestamp, item.value]),
              smooth: true,
              symbol: 'none',
              sampling: 'lttb', // 大数据量时使用采样优化
              itemStyle: {
                color: '#1890ff'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                    { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                  ]
                }
              },
              animation: false // 实时更新时关闭动画以提高性能
            }
          ]
        };

      case 'bar':
        // 柱状图按时间分组（每10秒一组）
        const barData = chart.data.reduce((acc, item) => {
          const key = Math.floor(item.timestamp / 10000) * 10000;
          if (!acc[key]) {
            acc[key] = { timestamp: key, value: 0, count: 0 };
          }
          acc[key].value += item.value;
          acc[key].count++;
          return acc;
        }, {} as Record<number, { timestamp: number; value: number; count: number }>);

        return {
          ...baseConfig,
          xAxis: {
            type: 'category',
            data: Object.values(barData).map((item) => new Date(item.timestamp).toLocaleTimeString()),
            axisLabel: {
              rotate: 45,
              color: isDark ? '#cccccc' : '#666666'
            },
            axisLine: {
              lineStyle: {
                color: isDark ? '#4a4a4a' : '#e0e0e0'
              }
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: isDark ? '#cccccc' : '#666666'
            },
            axisLine: {
              lineStyle: {
                color: isDark ? '#4a4a4a' : '#e0e0e0'
              }
            },
            splitLine: {
              lineStyle: {
                color: isDark ? '#333333' : '#f0f0f0'
              }
            }
          },
          series: [
            {
              name: chart.name,
              type: 'bar',
              data: Object.values(barData).map((item) => item.value),
              itemStyle: {
                color: '#52c41a',
                borderRadius: [4, 4, 0, 0]
              },
              animationDuration: 300
            }
          ]
        };

      case 'pie':
        // 饼图按类别分组
        const pieData = chart.data.reduce((acc, item) => {
          const label = item.label || '未分类';
          if (!acc[label]) {
            acc[label] = 0;
          }
          acc[label] += item.value;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...baseConfig,
          tooltip: {
            ...baseConfig.tooltip,
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            type: 'scroll',
            orient: 'horizontal',
            bottom: 0,
            textStyle: {
              color: isDark ? '#ffffff' : '#333333'
            },
            pageTextStyle: {
              color: isDark ? '#cccccc' : '#666666'
            }
          },
          series: [
            {
              name: chart.name,
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['50%', '40%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: isDark ? '#1a1a1a' : '#ffffff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 20,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: Object.entries(pieData).map(([name, value]) => ({ name, value })),
              animationDuration: 500
            }
          ]
        };

      default:
        return baseConfig;
    }
  }, [chart, theme]);

  // 窗口大小变化时自动调整图表
  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 图表导出功能
  const handleExport = () => {
    if (onDataExport) {
      onDataExport(chart.data);
    }

    // 导出为图片
    chartRef.current?.getEchartsInstance().getDataURL({
      pixelRatio: 2,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
    });
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{chart.name}</h3>
        <div className="chart-controls">
          <button
            onClick={handleExport}
            className="export-btn"
            style={{
              backgroundColor: theme === 'dark' ? '#4a4a4a' : '#f0f0f0',
              color: theme === 'dark' ? '#ffffff' : '#333333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            导出数据
          </button>
          <button
            onClick={() => chartRef.current?.getEchartsInstance().refresh()}
            className="refresh-btn"
            style={{
              backgroundColor: theme === 'dark' ? '#4a4a4a' : '#f0f0f0',
              color: theme === 'dark' ? '#ffffff' : '#333333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '8px'
            }}
          >
            刷新
          </button>
        </div>
      </div>
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        style={{ height }}
        notMerge={true}
        lazyUpdate={true} // 启用懒更新以提高性能
      />
      <style jsx>{`
        .chart-container {
          background: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'};
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 16px;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .chart-header h3 {
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          margin: 0;
          font-size: 18px;
        }
        .chart-controls {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default Chart;
