import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import api from '../utils/api';

export default function Register() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await api.post('/auth/register', values);
      message.success('Đăng ký thành công. Mời đăng nhập.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Register</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Register</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
