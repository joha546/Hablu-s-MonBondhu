import React from 'react';
import Navbar from '../ui/Navbar';
import Hero from '../ui/Hero';
import Features from '../ui/Features';
import Testimonials from '../ui/Testimonials';
import CTA from '../ui/CTA';
import Footer from '../ui/Footer';
import Stats from '../ui/Stats';
import Blog from '../ui/Blog';

const Home = () => {
    return (
        <div>
            <Navbar />
            <Hero />
            <Features />
            <Stats />
            <Testimonials />
            <Blog />
            <CTA />
            <Footer />
        </div>
    );
};

export default Home;