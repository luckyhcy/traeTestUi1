import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// 添加更多的日志语句
console.log('WebSocketServer imported successfully');
import cors from 'cors';
import dataGenerator from './data-generator.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 配置cors，允许所有来源
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// 存储历史数据
let historyData = dataGenerator.generateHistoryData();

// 提供历史数据接口
app.get('/api/history', (req, res) => {
  res.json(historyData);
});

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('Client connected');

  // 发送历史数据给新连接的客户端
  ws.send(JSON.stringify({
    type: 'history',
    data: historyData
  }));

  // 客户端断开连接处理
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // 客户端错误处理
  ws.on('error', (error) => {
    console.error('Client error:', error);
  });
});

// 定期生成并广播实时数据
setInterval(() => {
  const realTimeData = dataGenerator.generateData();

  // 更新历史数据
  for (const source in realTimeData) {
    if (historyData[source].length > 600) {
      historyData[source].shift();
    }
    historyData[source].push(realTimeData[source]);
  }

  // 广播实时数据给所有连接的客户端
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'realtime',
        data: realTimeData
      }));
    }
  });
}, 100);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});