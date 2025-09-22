import React from 'react';

const Main = () => {
  return (
    <main className="px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to MUN Marketplace
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          A marketplace exclusively for Memorial University of Newfoundland students
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for items"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-semibold">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Browse Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-red-500 hover:shadow-lg transition duration-200 cursor-pointer">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800">Books</h3>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-red-500 hover:shadow-lg transition duration-200 cursor-pointer">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-semibold text-gray-800">Electronics</h3>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-red-500 hover:shadow-lg transition duration-200 cursor-pointer">
            <div className="text-4xl mb-4">👕</div>
            <h3 className="text-xl font-semibold text-gray-800">Clothing</h3>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-red-500 hover:shadow-lg transition duration-200 cursor-pointer">
            <div className="text-4xl mb-4">🛋️</div>
            <h3 className="text-xl font-semibold text-gray-800">Furniture</h3>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Main;
