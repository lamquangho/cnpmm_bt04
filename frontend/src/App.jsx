import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Badge } from 'antd';
import { HomeOutlined, AppstoreOutlined, ShoppingOutlined, UserOutlined, LoginOutlined, SearchOutlined, ShoppingCartOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import { CartProvider, useCart } from '@lamquangho/shopping-cart-library';
import { ViewHistoryProvider } from './contexts/ViewHistoryContext';
import '@lamquangho/shopping-cart-library/dist/index.css';
import './styles/cart-integration.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Products from './pages/Products';
import SearchResults from './pages/SearchResults';
import RegisterTest from './pages/RegisterTest';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import ViewHistory from './pages/ViewHistory';
import ProductDetail from './pages/ProductDetail';
import SimpleTest from './SimpleTest';


const { Header, Content } = Layout;

// Navigation component that uses cart context
const Navigation = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
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
          icon: <SearchOutlined />,
          label: <Link to="/search">Tìm kiếm</Link>
        },
        {
          key: '5',
          icon: <HeartOutlined />,
          label: <Link to="/favorites">Yêu thích</Link>
        },
        {
          key: '6',
          icon: <HistoryOutlined />,
          label: <Link to="/view-history">Đã xem</Link>
        },
        {
          key: '7',
          icon: (
            <Badge count={totalItems} size="small" style={{ backgroundColor: '#ff4d4f' }}>
              <ShoppingCartOutlined />
            </Badge>
          ),
          label: <Link to="/cart">Giỏ hàng</Link>
        },
        {
          key: '8',
          icon: <LoginOutlined />,
          label: <Link to="/login">Đăng nhập</Link>
        },
        {
          key: '9',
          icon: <UserOutlined />,
          label: <Link to="/register">Đăng ký</Link>
        },
        {
          key: '10',
          label: <Link to="/test-register">🧪 Test Register</Link>
        },
      ]}
    />
  );
};

export default function App() {
  return (
    <CartProvider>
      <ViewHistoryProvider>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: 'white', marginRight: 40, fontSize: 18, fontWeight: 'bold' }}>
              <ShoppingOutlined style={{ marginRight: 8 }} />
              Shop Demo
            </div>
            <Navigation />
          </Header>
          <Content style={{ padding: '0 50px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ background: '#fff', padding: 24, minHeight: '100%' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route index element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:categoryId" element={<CategoryProducts />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/view-history" element={<ViewHistory />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/test-register" element={<RegisterTest />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </ViewHistoryProvider>
    </CartProvider>
  );
}
