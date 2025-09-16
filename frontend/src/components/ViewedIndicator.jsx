import { Badge } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useViewHistory } from '../contexts/ViewHistoryContext';

const ViewedIndicator = ({ productId, style = {} }) => {
    const { isViewed, getViewInfo, loading } = useViewHistory();

    if (loading || !isViewed(productId)) {
        return null;
    }

    const viewInfo = getViewInfo(productId);
    const viewCount = viewInfo ? viewInfo.viewCount : 0;

    return (
        <Badge
            count={
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '10px',
                    color: '#1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    border: '1px solid #1890ff',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    ...style
                }}>
                    <EyeOutlined style={{ marginRight: '2px' }} />
                    {viewCount > 1 ? `${viewCount}x` : 'Đã xem'}
                </div>
            }
            style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
        />
    );
};

export default ViewedIndicator;
