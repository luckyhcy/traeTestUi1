import { useEffect, useRef, useState, useCallback } from 'react';

export interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
  category?: string;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie';
  name: string;
  data: DataPoint[];
  maxPoints?: number;
}

export const useWebSocketClient = (url: string) => {
  const [connected, setConnected] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const dataBufferRef = useRef<Map<string, DataPoint[]>>(new Map());

  // 初始化WebSocket连接
  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const newData: DataPoint[] = JSON.parse(event.data);
        updateChartData(newData);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [url]);

  // 更新图表数据，使用缓冲和数据限制
  const updateChartData = useCallback((newDataPoints: DataPoint[]) => {
    setChartData((prevData) => {
      const updatedData = [...prevData];
      const dataMap = new Map(updatedData.map((chart) => [chart.id, chart]));

      newDataPoints.forEach((point) => {
        const chartId = point.category || 'default';
        let chart = dataMap.get(chartId);

        if (!chart) {
          // 自动检测图表类型
          const chartType = chartId.includes('pie') ? 'pie' : 
                           chartId.includes('bar') ? 'bar' : 'line';
          
          chart = {
            id: chartId,
            type: chartType,
            name: chartId.charAt(0).toUpperCase() + chartId.slice(1),
            data: [],
            maxPoints: 1000 // 默认最多保留1000个数据点
          };
          dataMap.set(chartId, chart);
        }

        // 添加新数据点
        chart.data.push(point);

        // 如果超过最大数据点限制，移除旧数据
        if (chart.maxPoints && chart.data.length > chart.maxPoints) {
          chart.data.shift();
        }
      });

      return Array.from(dataMap.values());
    });
  }, []);

  // 获取历史数据缓冲
  const getHistoricalData = useCallback((chartId: string, limit: number = 100) => {
    const buffer = dataBufferRef.current.get(chartId) || [];
    return buffer.slice(-limit);
  }, []);

  // 清空特定图表数据
  const clearChartData = useCallback((chartId: string) => {
    setChartData((prevData) => prevData.filter((chart) => chart.id !== chartId));
    dataBufferRef.current.delete(chartId);
  }, []);

  // 批量更新图表数据限制
  const setMaxDataPoints = useCallback((chartId: string, maxPoints: number) => {
    setChartData((prevData) =>
      prevData.map((chart) =>
        chart.id === chartId ? { ...chart, maxPoints } : chart
      )
    );
  }, []);

  return {
    connected,
    chartData,
    getHistoricalData,
    clearChartData,
    setMaxDataPoints
  };
};
