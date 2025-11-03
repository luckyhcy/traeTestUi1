import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Chart from './Chart';
import { useWebSocketClient, ChartData, DataPoint } from './WebSocketClient';
import { useInterval, useWindowSize } from 'react-use';

interface DashboardProps {
  wsUrl: string;
}

const Dashboard: React.FC<DashboardProps> = ({ wsUrl }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataLimit, setDataLimit] = useState(1000);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const { width } = useWindowSize();

  // WebSocket客户端
  const { connected, chartData, clearChartData, setMaxDataPoints } = useWebSocketClient(wsUrl);

  // 性能监控状态
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [dataThroughput, setDataThroughput] = useState(0);
  const [totalDataPoints, setTotalDataPoints] = useState(0);

  // 帧率监控
  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();

    const animate = () => {
      frames++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // 内存使用监控
  useInterval(() => {
    if (performance.memory) {
      setMemoryUsage((performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) as unknown as number);
    }
  }, 2000);

  // 数据吞吐量监控
  useInterval(() => {
    const total = chartData.reduce((sum, chart) => sum + chart.data.length, 0);
    setTotalDataPoints(total);
    
    // 计算数据增长速率
    if (totalDataPoints > 0) {
      const throughput = Math.abs(total - totalDataPoints);
      setDataThroughput(throughput);
    }
  }, 1000);

  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.classList.toggle('dark');
  }, []);

  // 导出数据为CSV
  const exportToCSV = useCallback((data: DataPoint[], chartName: string) => {
    const headers = ['timestamp', 'value', 'label', 'category'];
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const value = row[fieldName as keyof DataPoint];
            return typeof value === 'string' ? `"${value}"` : value;
          })
          .join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${chartName}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 处理图表数据导出
  const handleDataExport = useCallback((data: DataPoint[], chartName: string) => {
    exportToCSV(data, chartName);
  }, [exportToCSV]);

  // 切换图表显示
  const toggleChartVisibility = useCallback((chartId: string) => {
    setSelectedCharts((prev) =>
      prev.includes(chartId)
        ? prev.filter((id) => id !== chartId)
        : [...prev, chartId]
    );
  }, []);

  // 设置所有图表的数据点限制
  useEffect(() => {
    chartData.forEach((chart) => {
      setMaxDataPoints(chart.id, dataLimit);
    });
  }, [dataLimit, chartData, setMaxDataPoints]);

  // 过滤显示的图表
  const visibleCharts = useMemo(() => {
    if (selectedCharts.length === 0) return chartData;
    return chartData.filter((chart) => selectedCharts.includes(chart.id));
  }, [chartData, selectedCharts]);

  // 响应式列数
  const columns = useMemo(() => {
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
  }, [width]);

  return (
    <div className={`dashboard ${theme}`}>
      {/* 顶部导航栏 */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>实时数据可视化仪表盘</h1>
          <div className="connection-status">
            <span
              className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}
            />
            <span>{connected ? '已连接' : '未连接'}</span>
          </div>
        </div>
        <div className="header-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
          >
            {theme === 'light' ? '🌙 暗色模式' : '☀️ 亮色模式'}
          </button>
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`refresh-toggle-btn ${autoRefresh ? 'active' : ''}`}
          >
            {autoRefresh ? '⏸️ 暂停更新' : '▶️ 开始更新'}
          </button>
        </div>
      </header>

      {/* 性能监控面板 */}
      <div className="performance-panel">
        <div className="performance-card">
          <span className="metric-label">帧率 (FPS)</span>
          <span className={`metric-value ${fps < 30 ? 'warning' : fps < 60 ? 'caution' : 'good'}`}>
            {fps}
          </span>
        </div>
        <div className="performance-card">
          <span className="metric-label">内存使用 (MB)</span>
          <span className={`metric-value ${memoryUsage > 80 ? 'warning' : memoryUsage > 50 ? 'caution' : 'good'}`}>
            {memoryUsage}
          </span>
        </div>
        <div className="performance-card">
          <span className="metric-label">数据吞吐量</span>
          <span className="metric-value">{dataThroughput} 条/秒</span>
        </div>
        <div className="performance-card">
          <span className="metric-label">总数据点</span>
          <span className="metric-value">{totalDataPoints}</span>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="control-panel">
        <div className="control-group">
          <label htmlFor="dataLimit">最大数据点限制:</label>
          <select
            id="dataLimit"
            value={dataLimit}
            onChange={(e) => setDataLimit(Number(e.target.value))}
          >
            <option value={500}>500</option>
            <option value={1000}>1000</option>
            <option value={2000}>2000</option>
            <option value={5000}>5000</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>显示图表:</label>
          <div className="chart-selector">
            {chartData.map((chart) => (
              <label key={chart.id} className="chart-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCharts.length === 0 || selectedCharts.includes(chart.id)}
                  onChange={() => toggleChartVisibility(chart.id)}
                />
                <span>{chart.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 图表网格 */}
      <div className="charts-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {visibleCharts.length > 0 ? (
          visibleCharts.map((chart) => (
            <div key={chart.id} className="chart-item">
              <Chart
                chart={chart}
                theme={theme}
                onDataExport={(data) => handleDataExport(data, chart.name)}
                height="400px"
              />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>等待数据接收中...</p>
            {!connected && <p>请检查WebSocket连接</p>}
          </div>
        )}
      </div>

      {/* 页脚信息 */}
      <footer className="dashboard-footer">
        <p>实时数据可视化仪表盘 - 性能优化: useMemo, useCallback, 虚拟滚动, 数据采样</p>
      </footer>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: ${theme === 'light' ? '#f5f5f5' : '#121212'};
          color: ${theme === 'light' ? '#333333' : '#ffffff'};
          padding: 20px;
          transition: background 0.3s, color 0.3s;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${theme === 'light' ? '#e0e0e0' : '#333333'};
        }

        .header-left h1 {
          margin: 0;
          font-size: 28px;
          color: ${theme === 'light' ? '#1a1a1a' : '#ffffff'};
        }

        .connection-status {
          display: flex;
          align-items: center;
          margin-top: 8px;
          font-size: 14px;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-indicator.connected {
          background-color: #52c41a;
          animation: pulse 2s infinite;
        }

        .status-indicator.disconnected {
          background-color: #ff4d4f;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .header-right {
          display: flex;
          gap: 16px;
        }

        .theme-toggle-btn,
        .refresh-toggle-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .theme-toggle-btn {
          background: ${theme === 'light' ? '#1a1a1a' : '#ffffff'};
          color: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
        }

        .refresh-toggle-btn {
          background: ${autoRefresh ? '#52c41a' : '#ff7875'};
          color: white;
        }

        .refresh-toggle-btn:hover {
          opacity: 0.9;
        }

        .performance-panel {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .performance-card {
          flex: 1;
          min-width: 150px;
          background: ${theme === 'light' ? '#ffffff' : '#2a2a2a'};
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-label {
          font-size: 14px;
          color: ${theme === 'light' ? '#666666' : '#cccccc'};
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: ${theme === 'light' ? '#1a1a1a' : '#ffffff'};
        }

        .metric-value.good {
          color: #52c41a;
        }

        .metric-value.caution {
          color: #faad14;
        }

        .metric-value.warning {
          color: #ff4d4f;
        }

        .control-panel {
          background: ${theme === 'light' ? '#ffffff' : '#2a2a2a'};
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group:last-child {
          margin-bottom: 0;
        }

        .control-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
        }

        .control-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid ${theme === 'light' ? '#d9d9d9' : '#4a4a4a'};
          border-radius: 4px;
          background: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
          color: ${theme === 'light' ? '#333333' : '#ffffff'};
          font-size: 14px;
        }

        .chart-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .chart-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .charts-grid {
          display: grid;
          gap: 24px;
        }

        .chart-item {
          background: ${theme === 'light' ? '#ffffff' : '#2a2a2a'};
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s;
        }

        .chart-item:hover {
          transform: translateY(-2px);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 20px;
          background: ${theme === 'light' ? '#ffffff' : '#2a2a2a'};
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state p {
          margin: 8px 0;
          color: ${theme === 'light' ? '#666666' : '#cccccc'};
        }

        .dashboard-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid ${theme === 'light' ? '#e0e0e0' : '#333333'};
          text-align: center;
          font-size: 14px;
          color: ${theme === 'light' ? '#666666' : '#cccccc'};
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-right {
            margin-top: 16px;
            width: 100%;
            justify-content: space-between;
          }

          .performance-panel {
            flex-direction: column;
          }

          .performance-card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
