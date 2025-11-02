import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface DataPoint {
  value: number;
  timestamp: number;
}

interface ChartProps {
  data: DataPoint[];
  type: 'line' | 'bar' | 'pie';
  title: string;
  xLabel?: string;
  yLabel?: string;
  width?: number | string;
  height?: number | string;
  theme?: 'light' | 'dark';
  options?: EChartsOption;
}

const Chart: React.FC<ChartProps> = ({
  data,
  type,
  title,
  xLabel,
  yLabel,
  width = '100%',
  height = 400,
  theme = 'light',
  options = {}
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 格式化时间戳
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }, []);

  // 准备图表数据
  const chartData = useMemo(() => {
    if (type === 'pie') {
      // 饼图需要特殊处理
      return data.map((item, index) => ({
        name: formatTime(item.timestamp),
        value: item.value
      }));
    }

    // 折线图和柱状图
    return {
      xAxis: data.map(item => formatTime(item.timestamp)),
      yAxis: data.map(item => item.value)
    };
  }, [data, type, formatTime]);

  // 配置图表选项
  const chartOptions = useMemo(() => {
    const baseOptions: EChartsOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          let result = params[0].name + '<br/>';
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}<br/>`;
          });
          return result;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        backgroundColor: 'transparent'
      },
      toolbox: {
        feature: {
          saveAsImage: {
            pixelRatio: 2
          },
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          dataView: {
            readOnly: false
          }
        },
        iconStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        }
      },
      xAxis: type !== 'pie' ? {
        type: 'category',
        boundaryGap: type === 'bar',
        data: chartData.xAxis,
        axisLabel: {
          color: theme === 'dark' ? '#fff' : '#333'
        },
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#fff' : '#333'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      } : undefined,
      yAxis: type !== 'pie' ? {
        type: 'value',
        name: yLabel,
        axisLabel: {
          color: theme === 'dark' ? '#fff' : '#333'
        },
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#fff' : '#333'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      } : undefined,
      series: []
    };

    // 根据图表类型添加系列
    if (type === 'line') {
      baseOptions.series!.push({
        name: yLabel || 'Value',
        type: 'line',
        data: chartData.yAxis,
        smooth: true,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(76, 175, 80, 0.5)'
          }, {
            offset: 1,
            color: 'rgba(76, 175, 80, 0.05)'
          }])
        }
      });
    } else if (type === 'bar') {
      baseOptions.series!.push({
        name: yLabel || 'Value',
        type: 'bar',
        data: chartData.yAxis,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#4CAF50'
          }, {
            offset: 1,
            color: '#2E7D32'
          }])
        }
      });
    } else if (type === 'pie') {
      baseOptions.tooltip!.trigger = 'item';
      baseOptions.tooltip!.formatter = '{b}: {c} ({d}%)';
      baseOptions.legend = {
        orient: 'vertical',
        left: 'left',
        type: 'scroll',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        }
      };
      baseOptions.series!.push({
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      });
    }

    // 合并用户自定义选项
    return Object.assign({}, baseOptions, options);
  }, [type, title, yLabel, chartData, theme, options]);

  // 初始化和更新图表
  useEffect(() => {
    if (!chartRef.current) return;

    // 清理之前的实例
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    // 创建新的图表实例
    const chartInstance = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : 'light');
    chartInstanceRef.current = chartInstance;

    // 设置图表选项
    chartInstance.setOption(chartOptions);

    // 响应窗口大小变化
    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        chartInstance.resize();
      });
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      chartInstance.dispose();
    };
  }, [chartOptions, theme]);

  // 更新图表数据
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    // 使用requestAnimationFrame优化渲染性能
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      chartInstanceRef.current?.setOption(chartOptions, false);
    });
  }, [chartOptions]);

  return (
    <div
      ref={chartRef}
      style={{ width, height }}
    />
  );
};

export default React.memo(Chart);