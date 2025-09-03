import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { HomeOutlined, AppstoreOutlined, ShoppingOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Products from './pages/Products';
import SimpleTest from './SimpleTest';


const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', marginRight: 40, fontSize: 18, fontWeight: 'bold' }}>
          <ShoppingOutlined style={{ marginRight: 8 }} />
          Shop Demo
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectable={false}
          style={{ flex: 1 }}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: <Link to="/home">Trang chủ</Link>
            },
            {
              key: '2',
              icon: <AppstoreOutlined />,
              label: <Link to="/categories">Danh mục</Link>
            },
            {
              key: '3',
              icon: <ShoppingOutlined />,
              label: <Link to="/products">Sản phẩm</Link>
            },
            {
              key: '4',
              icon: <LoginOutlined />,
              label: <Link to="/login">Đăng nhập</Link>
            },
            {
              key: '5',
              icon: <UserOutlined />,
              label: <Link to="/register">Đăng ký</Link>
            },
            {
              key: '6',
              label: <Link to="/test">🔧 Test</Link>
            },

          ]}
        />
      </Header>
      <Content style={{ padding: '0 50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: '100%' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<CategoryProducts />} />
            <Route path="/products" element={<Products />} />
            <Route path="/test" element={<SimpleTest />} />

          </Routes>
        </div>
      </Content>
    </Layout>
  );
}
