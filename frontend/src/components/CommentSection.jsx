import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Rate, Typography, Spin, Alert, Avatar, Divider, Pagination, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { commentsAPI } from '../utils/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

const CommentSection = ({ productId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        loadComments();
    }, [productId]);

    const loadComments = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await commentsAPI.getByProduct(productId, { page, limit: 10 });

            if (response.data.success) {
                setComments(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error);
            setError('Có lỗi xảy ra khi tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (values) => {
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để bình luận');
            return;
        }

        try {
            setSubmitting(true);
            const response = await commentsAPI.create(productId, values);

            if (response.data.success) {
                form.resetFields();
                loadComments(); // Reload comments
                message.success('Đã đăng bình luận thành công');
            }
        } catch (error) {
            console.error('Lỗi khi tạo bình luận:', error);
            message.error('Có lỗi xảy ra khi đăng bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePageChange = (page) => {
        loadComments(page);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <Title level={4}>Đánh giá & Bình luận</Title>

            {/* Comment Form */}
            {isLoggedIn ? (
                <Card style={{ marginBottom: 24 }}>
                    <Form
                        form={form}
                        onFinish={handleSubmitComment}
                        layout="vertical"
                        initialValues={{ rating: 5 }}
                    >
                        <Form.Item
                            label="Đánh giá của bạn"
                            name="rating"
                            rules={[{ required: true, message: 'Vui lòng đánh giá sản phẩm' }]}
                        >
                            <Rate />
                        </Form.Item>

                        <Form.Item
                            label="Bình luận"
                            name="content"
                            rules={[
                                { required: true, message: 'Vui lòng nhập nội dung bình luận' },
                                { max: 500, message: 'Bình luận không được quá 500 ký tự' }
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                            >
                                Đăng bình luận
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            ) : (
                <Alert
                    message="Đăng nhập để viết bình luận"
                    description={
                        <span>
                            <a href="/login" style={{ color: '#1890ff' }}>Đăng nhập</a> để viết bình luận và đánh giá sản phẩm
                        </span>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Comments List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => loadComments()}>
                            Thử lại
                        </Button>
                    }
                />
            ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </Text>
                </div>
            ) : (
                <div>
                    {comments.map((comment) => (
                        <Card key={comment._id} style={{ marginBottom: 16 }}>
                            {/* Comment Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Avatar icon={<UserOutlined />} />
                                    <div>
                                        <Text strong>{comment.user?.username || 'Người dùng'}</Text>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {formatDate(comment.createdAt)}
                                            </Text>
                                        </div>
                                    </div>
                                </div>

                                {comment.rating && (
                                    <Rate disabled value={comment.rating} style={{ fontSize: 14 }} />
                                )}
                            </div>

                            {/* Comment Content */}
                            <div style={{ marginLeft: 44 }}>
                                <Text>{comment.content}</Text>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div style={{ marginTop: 16, paddingLeft: 16, borderLeft: '2px solid #f0f0f0' }}>
                                        {comment.replies.map((reply) => (
                                            <div key={reply._id} style={{ marginBottom: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <Avatar size="small" icon={<UserOutlined />} />
                                                    <Text strong style={{ fontSize: 12 }}>
                                                        {reply.user?.username || 'Người dùng'}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        {formatDate(reply.createdAt)}
                                                    </Text>
                                                </div>
                                                <Text style={{ fontSize: 13, marginLeft: 32 }}>
                                                    {reply.content}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <Pagination
                                current={pagination.currentPage}
                                total={pagination.totalItems}
                                pageSize={pagination.itemsPerPage}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;