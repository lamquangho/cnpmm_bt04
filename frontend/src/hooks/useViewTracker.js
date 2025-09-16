import { useEffect, useRef } from 'react';
import { useViewHistory } from '../contexts/ViewHistoryContext';

// Hook để theo dõi việc xem sản phẩm
export const useViewTracker = (productId, options = {}) => {
    const {
        delay = 2000, // Delay 2 giây trước khi ghi nhận view
        threshold = 0.5, // 50% sản phẩm xuất hiện trong viewport
        enabled = true // Có kích hoạt tracking không
    } = options;

    const { addView, isLoggedIn } = useViewHistory();
    const timeoutRef = useRef(null);
    const observerRef = useRef(null);
    const elementRef = useRef(null);
    const hasTracked = useRef(false);

    const trackView = async () => {
        if (!enabled || !productId || hasTracked.current || !isLoggedIn) return;

        try {
            await addView(productId);
            hasTracked.current = true;
            console.log(`Tracked view for product: ${productId}`);
        } catch (error) {
            console.error('Lỗi khi track view:', error);
        }
    };

    useEffect(() => {
        if (!enabled || !productId) return;

        // Reset tracking khi productId hoặc login status thay đổi
        hasTracked.current = false;

        // Intersection Observer để theo dõi khi sản phẩm xuất hiện trong viewport
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTracked.current) {
                        // Delay trước khi track
                        timeoutRef.current = setTimeout(() => {
                            trackView();
                        }, delay);
                    } else if (!entry.isIntersecting && timeoutRef.current) {
                        // Hủy timeout nếu element không còn visible
                        clearTimeout(timeoutRef.current);
                    }
                });
            },
            { threshold }
        );

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [productId, enabled, delay, threshold, isLoggedIn]);

    // Function để attach ref vào element cần track
    const attachRef = (element) => {
        if (element && observerRef.current) {
            elementRef.current = element;
            observerRef.current.observe(element);
        }
    };

    // Function để manually track view (ví dụ khi click)
    const manualTrack = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        trackView();
    };

    return { attachRef, manualTrack };
};

export default useViewTracker;
