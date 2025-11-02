import React, { useState, useMemo, useCallback, createContext, useContext } from 'react';
import Chart from './Chart';
import { useWebSocketClient } from './WebSocketClient';

// 主题上下文
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const Dashboard: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { data, isConnected, error } = useWebSocketClient();
  
  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);
  
  // 准备图表数据
  const chartData = useMemo(() => {
    const sources = Object.keys(data);
    return sources.map(source => ({
      id: source,
      name: source.charAt(0).toUpperCase() + source.slice(1),
      data: data[source] || [],
      type: source === 'energy' ? 'bar' : source === 'pressure' ? 'pie' : 'line'
    }));
  }, [data]);
  
  // 响应式布局配置
  const gridTemplateColumns = useMemo(() => {
    if (chartData.length <= 2) {
      return '1fr';
    } else if (chartData.length <= 4) {
      return '1fr 1fr';
    } else {
      return '1fr 1fr 1fr';
    }
  }, [chartData.length]);
  
  // 主题上下文值
  const themeContextValue = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className={`dashboard ${theme}`} style={dashboardStyles}>
        <header className="dashboard-header" style={headerStyles}>
          <h1 style={titleStyles}>实时数据可视化仪表盘</h1>
          <button
            onClick={toggleTheme}
            style={themeToggleStyles}
          >
            切换到{theme === 'light' ? '暗色' : '亮色'}模式
          </button>
          <div style={connectionStatusStyles}>
            <span>
              连接状态: {isConnected ? '已连接' : '未连接'}
            </span>
            {error && (
              <span style={errorStyles}>
                错误: {error}
              </span>
            )}
          </div>
        </header>
        
        <main className="dashboard-main" style={{
          ...mainStyles,
          gridTemplateColumns
        }}>
          {chartData.map(chart => (
            <div key={chart.id} className="chart-container" style={chartContainerStyles}>
              <Chart
                data={chart.data}
                type={chart.type}
                title={chart.name}
                yLabel={chart.name}
                theme={theme}
                options={chart.type === 'pie' ? {
                  series: [{
                    radius: ['30%', '70%']
                  }]
                } : {}}
              />
            </div>
          ))}
          
          {chartData.length === 0 && (
            <div style={emptyStateStyles}>
              <h3>暂无数据</h3>
              <p>请确保WebSocket服务器已启动</p>
            </div>
          )}
        </main>
        
        <footer className="dashboard-footer" style={footerStyles}>
          <p>实时数据可视化仪表盘 © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
};

// 样式
const dashboardStyles: React.CSSProperties = {
  minHeight: '100vh',
  transition: 'background-color 0.3s, color 0.3s',
  overflowX: 'hidden'
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  transition: 'border-color 0.3s'
};

const titleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: '1.8rem',
  transition: 'color 0.3s'
};

const themeToggleStyles: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s, color 0.3s',
  fontWeight: 'bold'
};

const connectionStatusStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end'
};

const errorStyles: React.CSSProperties = {
  color: 'red',
  fontSize: '0.9rem'
};

const mainStyles: React.CSSProperties = {
  display: 'grid',
  gap: '2rem',
  padding: '2rem',
  transition: 'background-color 0.3s'
};

const chartContainerStyles: React.CSSProperties = {
  borderRadius: '8px',
  padding: '1rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'box-shadow 0.3s, background-color 0.3s'
};

const emptyStateStyles: React.CSSProperties = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '4rem 0',
  color: 'rgba(0, 0, 0, 0.5)',
  transition: 'color 0.3s'
};

const footerStyles: React.CSSProperties = {
  textAlign: 'center',
  padding: '1rem',
  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  transition: 'border-color 0.3s, color 0.3s'
};

// 主题样式
const lightThemeStyles: React.CSSProperties = {
  backgroundColor: '#fff',
  color: '#333'
};

const darkThemeStyles: React.CSSProperties = {
  backgroundColor: '#121212',
  color: '#fff'
};

const lightHeaderStyles: React.CSSProperties = {
  borderColor: 'rgba(0, 0, 0, 0.1)'
};

const darkHeaderStyles: React.CSSProperties = {
  borderColor: 'rgba(255, 255, 255, 0.1)'
};

const lightMainStyles: React.CSSProperties = {
  backgroundColor: '#fff'
};

const darkMainStyles: React.CSSProperties = {
  backgroundColor: '#121212'
};

const lightChartContainerStyles: React.CSSProperties = {
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const darkChartContainerStyles: React.CSSProperties = {
  backgroundColor: '#1e1e1e',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
};

const lightFooterStyles: React.CSSProperties = {
  borderColor: 'rgba(0, 0, 0, 0.1)'
};

const darkFooterStyles: React.CSSProperties = {
  borderColor: 'rgba(255, 255, 255, 0.1)'
};

const lightThemeToggleStyles: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  color: '#fff'
};

const darkThemeToggleStyles: React.CSSProperties = {
  backgroundColor: '#2196F3',
  color: '#fff'
};

// 导出主题样式钩子
export const useThemeStyles = () => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    if (theme === 'light') {
      return {
        dashboard: lightThemeStyles,
        header: lightHeaderStyles,
        main: lightMainStyles,
        chartContainer: lightChartContainerStyles,
        footer: lightFooterStyles,
        themeToggle: lightThemeToggleStyles
      };
    } else {
      return {
        dashboard: darkThemeStyles,
        header: darkHeaderStyles,
        main: darkMainStyles,
        chartContainer: darkChartContainerStyles,
        footer: darkFooterStyles,
        themeToggle: darkThemeToggleStyles
      };
    }
  }, [theme]);
};

export default React.memo(Dashboard);