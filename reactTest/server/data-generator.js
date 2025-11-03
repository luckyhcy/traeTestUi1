// 数据生成器，用于生成模拟实时数据

const DATA_SOURCES = [
  { id: 'temperature', name: '温度传感器', type: 'line', min: 20, max: 35, interval: 100 },
  { id: 'humidity', name: '湿度传感器', type: 'line', min: 40, max: 80, interval: 150 },
  { id: 'pressure', name: '压力传感器', type: 'line', min: 980, max: 1020, interval: 200 },
  { id: 'traffic', name: '网络流量', type: 'bar', min: 100, max: 1000, interval: 100 },
  { id: 'cpu', name: 'CPU使用率', type: 'line', min: 0, max: 100, interval: 50 },
  { id: 'memory', name: '内存使用率', type: 'line', min: 0, max: 100, interval: 75 },
  { id: 'disk', name: '磁盘使用率', type: 'line', min: 0, max: 100, interval: 125 },
  { id: 'requests', name: '请求分布', type: 'pie', min: 10, max: 100, interval: 200 },
  { id: 'errors', name: '错误类型', type: 'pie', min: 1, max: 50, interval: 300 },
  { id: 'users', name: '用户在线', type: 'line', min: 100, max: 10000, interval: 250 }
];

const REQUEST_TYPES = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const ERROR_TYPES = ['404', '500', '403', '401', '503'];

class DataGenerator {
  constructor() {
    this.dataSources = DATA_SOURCES;
    this.dataBuffer = new Map();
    
    // 初始化数据缓冲区
    this.dataSources.forEach(source => {
      this.dataBuffer.set(source.id, []);
    });
  }

  // 生成随机数据点
  generateDataPoint(source) {
    const timestamp = Date.now();
    const value = Math.random() * (source.max - source.min) + source.min;
    
    const dataPoint = {
      timestamp,
      value: parseFloat(value.toFixed(2)),
      category: source.id
    };

    // 为饼图添加额外标签
    if (source.type === 'pie') {
      if (source.id === 'requests') {
        dataPoint.label = REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)];
      } else if (source.id === 'errors') {
        dataPoint.label = ERROR_TYPES[Math.floor(Math.random() * ERROR_TYPES.length)];
      }
    }

    // 保存到缓冲区
    const buffer = this.dataBuffer.get(source.id);
    buffer.push(dataPoint);
    
    // 限制缓冲区大小
    if (buffer.length > 10000) {
      buffer.shift();
    }

    return dataPoint;
  }

  // 生成批量数据
  generateBatchData(count = 10) {
    const batch = [];
    
    for (let i = 0; i < count; i++) {
      const source = this.dataSources[Math.floor(Math.random() * this.dataSources.length)];
      batch.push(this.generateDataPoint(source));
    }

    return batch;
  }

  // 按数据源生成数据
  generateDataBySource(sourceId) {
    const source = this.dataSources.find(s => s.id === sourceId);
    if (source) {
      return this.generateDataPoint(source);
    }
    return null;
  }

  // 获取历史数据
  getHistoricalData(sourceId, limit = 100) {
    const buffer = this.dataBuffer.get(sourceId) || [];
    return buffer.slice(-limit);
  }

  // 获取所有数据源
  getSources() {
    return this.dataSources;
  }
}

module.exports = DataGenerator;
