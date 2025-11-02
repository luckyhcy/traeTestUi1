class DataGenerator {
  constructor() {
    this.sources = {
      temperature: {
        min: 20,
        max: 35,
        current: 25,
        trend: 0.1
      },
      humidity: {
        min: 30,
        max: 80,
        current: 50,
        trend: 0.2
      },
      pressure: {
        min: 980,
        max: 1020,
        current: 1000,
        trend: -0.5
      },
      energy: {
        min: 0,
        max: 1000,
        current: 500,
        trend: 2
      }
    };
  }

  generateData() {
    const timestamp = Date.now();
    const data = {};

    for (const source in this.sources) {
      if (Math.random() > 0.95) {
        this.sources[source].trend = -this.sources[source].trend;
      }

      this.sources[source].current += this.sources[source].trend * (0.5 + Math.random());
      this.sources[source].current = Math.min(
        this.sources[source].max,
        Math.max(this.sources[source].min, this.sources[source].current)
      );

      data[source] = {
        value: parseFloat(this.sources[source].current.toFixed(2)),
        timestamp
      };
    }

    return data;
  }

  generateHistoryData(duration = 600000) {
    const history = {};
    const endTime = Date.now();
    const startTime = endTime - duration;
    const interval = 1000;

    for (let timestamp = startTime; timestamp <= endTime; timestamp += interval) {
      for (const source in this.sources) {
        if (!history[source]) {
          history[source] = [];
        }

        const value = this.sources[source].min + Math.random() * (this.sources[source].max - this.sources[source].min);
        history[source].push({ value: parseFloat(value.toFixed(2)), timestamp });
      }
    }

    return history;
  }
}

export default new DataGenerator();