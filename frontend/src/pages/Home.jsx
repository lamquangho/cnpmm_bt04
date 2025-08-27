import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/home')
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        message.error('Không thể lấy dữ liệu (cần đăng nhập)');
        navigate('/login');
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Home (Protected)</h2>
      {data ? (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <Button onClick={logout}>Logout</Button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
