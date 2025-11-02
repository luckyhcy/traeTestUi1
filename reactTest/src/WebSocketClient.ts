import { useState, useEffect, useCallback } from 'react';

interface DataPoint {
  value: number;
  timestamp: number;
}

interface DataSource {
  [key: string]: DataPoint[];
}

export const useWebSocketClient = () => {
  const [data, setData] = useState<DataSource>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'history') {
        setData(message.data);
      } else if (message.type === 'realtime') {
        setData(prevData => {
          const newData = { ...prevData };
          
          for (const source in message.data) {
            if (!newData[source]) {
              newData[source] = [];
            }
            
            newData[source] = [...newData[source], message.data[source]];
            
            // 限制数据长度，保留最近10分钟的数据（600个点，每秒1个点）
            if (newData[source].length > 600) {
              newData[source] = newData[source].slice(-600);
            }
          }
          
          return newData;
        });
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
      setError('Error parsing data from server');
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };
    
    ws.onmessage = handleMessage;
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket error code:', error.code);
      console.error('WebSocket error message:', error.message);
      setError('Failed to connect to WebSocket server');
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setError('Disconnected from WebSocket server');
    };
    
    return () => {
      ws.close();
    };
  }, [handleMessage]);

  return {
    data,
    isConnected,
    error
  };
};

// 数据缓冲队列
class DataBuffer {
  private buffer: DataPoint[];
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.buffer = [];
    this.maxSize = maxSize;
  }

  add(dataPoint: DataPoint) {
    this.buffer.push(dataPoint);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  get() {
    return [...this.buffer];
  }

  clear() {
    this.buffer = [];
  }
}

export const dataBuffer = new DataBuffer();