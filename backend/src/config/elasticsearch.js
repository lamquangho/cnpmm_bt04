const { Client } = require('@elastic/elasticsearch');

// Tạo Elasticsearch client
const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    // Cấu hình cho development
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
});

// Test kết nối
const testConnection = async () => {
    try {
        const health = await client.cluster.health();
        console.log('Elasticsearch connected:', health.status);
        return true;
    } catch (error) {
        console.warn('Elasticsearch not available:', error.message);
        console.warn('Fuzzy search sẽ fallback về MongoDB text search');
        return false;
    }
};

module.exports = {
    client,
    testConnection
};
