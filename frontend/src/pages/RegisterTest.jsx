import React, { useState } from 'react';
import { Button, Input, Card, message } from 'antd';

const RegisterTest = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleTest = async () => {
        setLoading(true);
        try {
            console.log('Testing API with:', formData);
            console.log('API URL:', `http://localhost:5000/api/auth/register`);

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username || 'testuser' + Date.now(),
                    email: formData.email || `test${Date.now()}@test.com`,
                    password: formData.password || '123456'
                })
            });

            const result = await response.json();
            console.log('Response:', response.status, result);

            if (response.ok) {
                message.success('✅ Test Register thành công!');
            } else {
                message.error(`❌ Test thất bại: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error(`❌ Network Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🧪 Test Register API" style={{ maxWidth: 500, margin: '20px auto' }}>
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Username (optional)"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    style={{ marginBottom: 8 }}
                />
                <Input
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{ marginBottom: 8 }}
                />
                <Input.Password
                    placeholder="Password (optional)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
            </div>

            <Button
                type="primary"
                loading={loading}
                onClick={handleTest}
                style={{ width: '100%' }}
            >
                🚀 Test Register API
            </Button>

            <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
                Mở Browser Console (F12) để xem logs chi tiết
            </div>
        </Card>
    );
};

export default RegisterTest;
