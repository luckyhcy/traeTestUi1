// WebSocket服务器，用于推送实时数据

const http = require('http');
const WebSocket = require('ws');
const DataGenerator = require('./data-generator');

const PORT = process.env.PORT || 3001;
const UPDATE_INTERVAL = 100; // 每100ms推送一次数据
const BATCH_SIZE = 5; // 每次推送5条数据

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Real-time Data Visualization Server\n');
});

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 数据生成器实例
const dataGenerator = new DataGenerator();

// 客户端连接管理
const clients = new Set();

// 性能监控
let totalDataSent = 0;
let totalConnections = 0;

// 定期推送数据
setInterval(() => {
  if (clients.size === 0) return;

  // 生成批量数据
  const dataBatch = dataGenerator.generateBatchData(BATCH_SIZE);
  const dataString = JSON.stringify(dataBatch);

  // 发送给所有连接的客户端
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(dataString, (error) => {
        if (error) {
          console.error('Error sending data:', error);
          clients.delete(client);
        }
      });
    } else {
      clients.delete(client);
    }
  });

  totalDataSent += dataBatch.length;
}, UPDATE_INTERVAL);

// 处理新连接
wss.on('connection', (ws) => {
  totalConnections++;
  clients.add(ws);

  console.log(`New connection established. Total clients: ${clients.size}`);

  // 发送欢迎消息和初始数据
  const welcomeMessage = {
    type: 'welcome',
    message: 'Connected to real-time data server',
    timestamp: Date.now(),
    sources: dataGenerator.getSources()
  };
  ws.send(JSON.stringify(welcomeMessage));

  // 发送历史数据（每个数据源前100条）
  dataGenerator.getSources().forEach(source => {
    const historicalData = dataGenerator.getHistoricalData(source.id, 100);
    if (historicalData.length > 0) {
      ws.send(JSON.stringify(historicalData));
    }
  });

  // 处理客户端消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // 处理不同类型的消息
      switch (data.type) {
        case 'subscribe':
          console.log(`Client subscribed to: ${data.sources.join(', ')}`);
          // 可以在这里实现订阅逻辑
          break;
        case 'unsubscribe':
          console.log(`Client unsubscribed from: ${data.sources.join(', ')}`);
          break;
        case 'history':
          if (data.sourceId) {
            const history = dataGenerator.getHistoricalData(data.sourceId, data.limit || 100);
            ws.send(JSON.stringify(history));
          }
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Connection closed. Total clients: ${clients.size}`);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n🚀 Real-time Data Visualization Server started`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
  console.log(`📊 Data update interval: ${UPDATE_INTERVAL}ms`);
  console.log(`📦 Batch size per update: ${BATCH_SIZE} records`);
  console.log(`\nPress Ctrl+C to stop the server\n`);

  // 定期打印服务器状态
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`\n📈 Server Status:`);
    console.log(`   Active connections: ${clients.size}`);
    console.log(`   Total data sent: ${totalDataSent.toLocaleString()} records`);
    console.log(`   Memory usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total connections: ${totalConnections}`);
  }, 10000);
});

// 处理服务器关闭
process.on('SIGINT', () => {
  console.log(`\n\n🛑 Server shutting down...`);
  console.log(`📊 Total data sent during session: ${totalDataSent.toLocaleString()} records`);
  console.log(`👋 Goodbye!\n`);
  process.exit(0);
});
