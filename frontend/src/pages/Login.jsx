import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import api from '../utils/api';

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await api.post('/auth/login', values);
      localStorage.setItem('token', res.data.token);
      message.success('Đăng nhập thành công');
      navigate('/home');
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Login</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Login</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
