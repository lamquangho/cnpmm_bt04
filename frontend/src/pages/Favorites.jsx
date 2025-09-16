import { useEffect } from 'react';
import FavoritesList from '../components/FavoritesList';

const Favorites = () => {
    useEffect(() => {
        document.title = 'Sản phẩm yêu thích - Shop';
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
                    <p className="mt-2 text-gray-600">
                        Những sản phẩm bạn đã thêm vào danh sách yêu thích
                    </p>
                </div>

                <FavoritesList />
            </div>
        </div>
    );
};

export default Favorites;
