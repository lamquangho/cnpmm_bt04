import React from 'react';
import { Typography, Card } from 'antd';
import { ShoppingCart } from '@lamquangho/shopping-cart-library';

const { Title } = Typography;

const Cart = () => {
    const handleCheckout = (items) => {
        console.log('Checkout items:', items);

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Show confirmation
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        alert(`Thanh toán thành công!\nSố lượng: ${itemCount} sản phẩm\nTổng tiền: $${total.toFixed(2)}`);

        // Here you would typically integrate with your payment processing system
        // For now, we'll just show a success message
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
            <Card>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                    🛒 Giỏ hàng của bạn
                </Title>

                <ShoppingCart
                    onCheckout={handleCheckout}
                    showCheckoutButton={true}
                    showClearButton={true}
                />
            </Card>
        </div>
    );
};

export default Cart;
