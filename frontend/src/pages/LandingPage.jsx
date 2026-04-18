import React, { Suspense, lazy } from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import LazySection from '../components/LazySection';

// Lazy loading components below the fold to improve initial page load speed
const Features = lazy(() => import('../components/landing/Features'));
const IntegrationsStrip = lazy(() => import('../components/landing/Features').then(module => ({ default: module.IntegrationsStrip })));
const Pricing = lazy(() => import('../components/landing/Pricing'));
const DemoRequest = lazy(() => import('../components/landing/DemoRequest'));
const Footer = lazy(() => import('../components/landing/Footer'));

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
            <Header />
            <main>
                {/* Hero is loaded immediately as it is visible on first paint */}
                <Hero />
                
                <LazySection threshold={0.05} minHeight="min-h-[600px]">
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-50 dark:bg-[#0B1120] animate-pulse"></div>}>
                        <Features />
                    </Suspense>
                </LazySection>

                <LazySection threshold={0.05} minHeight="min-h-[600px]">
                    <Suspense fallback={<div className="h-[600px] w-full bg-white dark:bg-[#0F172A] animate-pulse"></div>}>
                        <Pricing />
                    </Suspense>
                </LazySection>

                <LazySection threshold={0.05} minHeight="min-h-[500px]">
                    <Suspense fallback={<div className="h-[500px] w-full bg-white dark:bg-[#0F172A] animate-pulse"></div>}>
                        <DemoRequest />
                    </Suspense>
                </LazySection>
            </main>

            <LazySection threshold={0.05} minHeight="min-h-[200px]">
                <section className="py-16 bg-white dark:bg-[#0F172A]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Suspense fallback={<div className="h-[100px] bg-gray-100 dark:bg-white/[0.05] rounded-2xl animate-pulse"></div>}>
                            <IntegrationsStrip />
                        </Suspense>
                    </div>
                </section>
            </LazySection>

            <LazySection threshold={0.05} minHeight="min-h-[300px]">
                <Suspense fallback={<div className="h-[300px] w-full bg-gray-900 dark:bg-[#030712] animate-pulse"></div>}>
                    <Footer />
                </Suspense>
            </LazySection>

            {/* Simple CSS animation for when sections load in */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
