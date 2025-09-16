import { createContext, useContext, useState, useEffect } from 'react';
import { viewHistoryAPI } from '../utils/api';

const ViewHistoryContext = createContext();

export const useViewHistory = () => {
    const context = useContext(ViewHistoryContext);
    if (!context) {
        throw new Error('useViewHistory must be used within ViewHistoryProvider');
    }
    return context;
};

export const ViewHistoryProvider = ({ children }) => {
    const [viewedProducts, setViewedProducts] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        if (token) {
            loadViewHistory();
        }
    }, []);

    const loadViewHistory = async () => {
        try {
            setLoading(true);
            const response = await viewHistoryAPI.getAll({ limit: 1000 });

            if (response.data.success) {
                const viewMap = new Map();
                response.data.data.forEach(item => {
                    viewMap.set(item.product._id, {
                        viewCount: item.viewCount,
                        lastViewedAt: item.lastViewedAt
                    });
                });
                setViewedProducts(viewMap);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử xem:', error);
            // Nếu lỗi, chỉ set empty map
            setViewedProducts(new Map());
        } finally {
            setLoading(false);
        }
    };

    const addView = async (productId) => {
        if (!isLoggedIn) return;

        try {
            await viewHistoryAPI.add(productId);

            // Update local state
            setViewedProducts(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(productId);
                newMap.set(productId, {
                    viewCount: existing ? existing.viewCount + 1 : 1,
                    lastViewedAt: new Date().toISOString()
                });
                return newMap;
            });
        } catch (error) {
            console.error('Lỗi khi thêm view:', error);
        }
    };

    const isViewed = (productId) => {
        return viewedProducts.has(productId);
    };

    const getViewInfo = (productId) => {
        return viewedProducts.get(productId) || null;
    };

    return (
        <ViewHistoryContext.Provider value={{
            viewedProducts,
            loading,
            isLoggedIn,
            addView,
            isViewed,
            getViewInfo,
            refreshViewHistory: loadViewHistory
        }}>
            {children}
        </ViewHistoryContext.Provider>
    );
};

export default ViewHistoryContext;
