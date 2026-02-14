import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export const HomePage = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Personalized Goals',
      description: 'Set your health goals and let AI recommend recipes tailored to your needs',
    },
    {
      icon: '📊',
      title: 'Nutrition Tracking',
      description: 'Monitor calories, sugar, sodium, and protein in every recipe',
    },
    {
      icon: '❤️',
      title: 'Allergy Safe',
      description: 'Get recommendations free from your allergies and dietary restrictions',
    },
    {
      icon: '🔄',
      title: 'Smart Filtering',
      description: 'Backend filtering ensures every recipe matches your constraints',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">Personalized Nutrition Recommendations</h1>
          <p className="text-xl opacity-90 mb-8">
            Get AI-powered recipe recommendations tailored to your health goals, allergies, and dietary preferences
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose Foodoscope?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white rounded-lg shadow-lg p-12 mb-12">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                1
              </div>
              <h3 className="font-semibold text-gray-800 text-center mb-2">Register</h3>
              <p className="text-gray-600 text-sm text-center">
                Create your account with email and password
              </p>
            </div>

            <div className="relative">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                2
              </div>
              <h3 className="font-semibold text-gray-800 text-center mb-2">Set Your Goals</h3>
              <p className="text-gray-600 text-sm text-center">
                Tell us your health goals, diet type, and allergies
              </p>
            </div>

            <div className="relative">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                3
              </div>
              <h3 className="font-semibold text-gray-800 text-center mb-2">Get Recipes</h3>
              <p className="text-gray-600 text-sm text-center">
                Receive personalized recipe recommendations based on your profile
              </p>
            </div>

            <div className="relative">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                4
              </div>
              <h3 className="font-semibold text-gray-800 text-center mb-2">Cook & Enjoy</h3>
              <p className="text-gray-600 text-sm text-center">
                Save favorites and explore new recipes daily
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-secondary to-primary rounded-lg p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Health?</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are making healthier food choices with personalized recommendations
        </p>
        <Link
          to="/register"
          className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition inline-block"
        >
          Start Your Journey Today
        </Link>
      </div>
    </Layout>
  );
};

export default HomePage;
