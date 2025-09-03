import React, { useState } from 'react';
import { Button, Typography, Alert, Card } from 'antd';

const { Title, Text } = Typography;

const SimpleTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing API...');
      const response = await fetch('http://localhost:5000/api/products?page=1&limit=3');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      setResult(data);
      
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>🔧 Simple API Test</Title>
      
      <Button 
        type="primary" 
        onClick={testAPI} 
        loading={loading}
        size="large"
      >
        Test Products API
      </Button>

      {error && (
        <Alert 
          message="Lỗi" 
          description={error} 
          type="error" 
          style={{ marginTop: 20 }}
        />
      )}

      {result && (
        <Card title="API Response" style={{ marginTop: 20 }}>
          <Text>Success: {result.success ? '✅' : '❌'}</Text><br/>
          <Text>Total Products: {result.data?.length || 0}</Text><br/>
          <Text>First Product: {result.data?.[0]?.name || 'N/A'}</Text>
        </Card>
      )}
    </div>
  );
};

export default SimpleTest;
