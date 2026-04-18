import React, { useRef, useState, useEffect } from 'react';

const LazySection = ({ children, className = '', threshold = 0.05, minHeight = "min-h-[300px]" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Stop observing once it's visible
                }
            },
            { threshold }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) observer.unobserve(sectionRef.current);
            observer.disconnect();
        };
    }, [threshold]);

    return (
        <div ref={sectionRef} className={className}>
            {isVisible ? (
                <div className="animate-[fadeIn_0.5s_ease-out]">
                    {children}
                </div>
            ) : (
                <div className={`${minHeight} flex flex-col items-center justify-center opacity-50`}>
                    <div className="w-8 h-8 border-4 border-[#2C5F8D] dark:border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                </div>
            )}
        </div>
    );
};

export default LazySection;
