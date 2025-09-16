import { useState } from 'react';
import { Card, Alert, Button, Space, Typography, Divider } from 'antd';
import { HeartOutlined, EyeOutlined, CommentOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const FeatureDemo = () => {
    const [showDemo, setShowDemo] = useState(false);

    const isLoggedIn = !!localStorage.getItem('token');

    const features = [
        {
            icon: <HeartOutlined style={{ color: '#ff4d4f' }} />,
            title: 'Sản phẩm yêu thích',
            description: 'Click vào icon ❤️ trên góc phải của từng sản phẩm để thêm vào yêu thích. Xem danh sách trong menu "Yêu thích".',
            status: isLoggedIn ? 'ready' : 'login-required'
        },
        {
            icon: <EyeOutlined style={{ color: '#1890ff' }} />,
            title: 'Lịch sử xem sản phẩm',
            description: 'Khi bạn xem sản phẩm trong 3 giây, hệ thống sẽ tự động ghi nhận. Badge "Đã xem" sẽ xuất hiện trên sản phẩm.',
            status: isLoggedIn ? 'ready' : 'login-required'
        },
        {
            icon: <CommentOutlined style={{ color: '#52c41a' }} />,
            title: 'Bình luận & Đánh giá',
            description: 'Vào trang chi tiết sản phẩm để viết bình luận và đánh giá sao. Có thể reply bình luận khác.',
            status: isLoggedIn ? 'ready' : 'login-required'
        },
        {
            icon: <BarChartOutlined style={{ color: '#722ed1' }} />,
            title: 'Thống kê sản phẩm',
            description: 'Xem số khách mua, lượt xem, bình luận ngay trên trang chi tiết sản phẩm.',
            status: 'ready'
        }
    ];

    if (!showDemo) {
        return (
            <Button
                type="primary"
                size="small"
                onClick={() => setShowDemo(true)}
                style={{
                    position: 'fixed',
                    bottom: 80,
                    right: 20,
                    zIndex: 1000,
                    borderRadius: '20px'
                }}
            >
                🎉 Tính năng mới
            </Button>
        );
    }

    return (
        <Card
            title="🚀 Hướng dẫn sử dụng chức năng mới"
            extra={
                <Button size="small" onClick={() => setShowDemo(false)}>
                    Đóng
                </Button>
            }
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000,
                maxWidth: '400px',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
        >
            {!isLoggedIn && (
                <Alert
                    message="Yêu cầu đăng nhập"
                    description="Hầu hết tính năng cần đăng nhập để sử dụng"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" type="primary" href="/login">
                            Đăng nhập
                        </Button>
                    }
                />
            )}

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {features.map((feature, index) => (
                    <div key={index}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ fontSize: '20px', marginTop: 2 }}>
                                {feature.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text strong>{feature.title}</Text>
                                <div style={{ marginTop: 4, fontSize: '13px', color: '#666' }}>
                                    {feature.description}
                                </div>
                                {feature.status === 'login-required' && !isLoggedIn && (
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        (Cần đăng nhập)
                                    </Text>
                                )}
                            </div>
                        </div>
                        {index < features.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                    </div>
                ))}
            </Space>

            <Divider />

            <div style={{ textAlign: 'center' }}>
                <Space>
                    <Button size="small" href="/products">
                        Xem sản phẩm
                    </Button>
                    {isLoggedIn && (
                        <>
                            <Button size="small" href="/favorites">
                                Yêu thích
                            </Button>
                            <Button size="small" href="/view-history">
                                Đã xem
                            </Button>
                        </>
                    )}
                </Space>
            </div>
        </Card>
    );
};

export default FeatureDemo;
