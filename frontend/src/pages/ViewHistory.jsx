import { useEffect } from 'react';
import ViewHistoryList from '../components/ViewHistoryList';

const ViewHistory = () => {
    useEffect(() => {
        document.title = 'Lịch sử xem - Shop';
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Lịch sử xem sản phẩm</h1>
                    <p className="mt-2 text-gray-600">
                        Những sản phẩm bạn đã xem gần đây
                    </p>
                </div>

                <ViewHistoryList />
            </div>
        </div>
    );
};

export default ViewHistory;
