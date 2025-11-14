/**
 * @page HomePage
 * @summary Home page displaying weather information.
 * @domain weather
 * @type dashboard-page
 * @category public
 */
export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">WeatherNow</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Weather information will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
