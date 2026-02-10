import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
                <Hero />
                <Features />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
