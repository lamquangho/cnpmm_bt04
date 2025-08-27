import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <div style={{ float: 'left', color: 'white', marginRight: 20 }}>Fullstack Demo</div>
        <Menu theme="dark" mode="horizontal" selectable={false} items={[
          { key: '1', label: <Link to="/login">Login</Link> },
          { key: '2', label: <Link to="/register">Register</Link> },
          { key: '3', label: <Link to="/home">Home</Link> },
        ]}/>
      </Header>
      <Content style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Content>
    </Layout>
  );
}
