
import { Link } from 'react-router-dom';
import { Users, Calendar, Mail, Book } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Users,
      title: 'Office Bearers',
      description: 'Meet our distinguished office bearers and their contributions to plant breeding',
      link: '/office-bearers'
    },
    {
      icon: Book,
      title: 'Mandate & Activities',
      description: 'Learn about our mission, objectives and key activities',
      link: '/mandate-activities'
    },
    {
      icon: Calendar,
      title: 'Conferences',
      description: 'Explore past conferences and upcoming events in plant breeding',
      link: '/conference'
    },
    {
      icon: Mail,
      title: 'Membership',
      description: 'Join our community of plant breeding professionals and researchers',
      link: '/membership'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-4xl">I</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Indian Society of
              <span className="block text-green-600">Plant Breeders</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Advancing plant breeding science for sustainable agriculture and food security through research, 
              education, and collaboration among scientists, researchers, and professionals.
            </p>
            <div className="space-x-4">
              <Link
                to="/membership"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Join ISPB
              </Link>
              <Link
                to="/genesis"
                className="inline-block border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore ISPB</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our initiatives, connect with fellow researchers, and contribute to the advancement of plant breeding science.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                The Indian Society of Plant Breeders is dedicated to promoting excellence in plant breeding 
                research and education. We foster collaboration among scientists, support innovative research, 
                and disseminate knowledge to advance agricultural sustainability.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Promote scientific research in plant breeding and genetics</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Foster collaboration between researchers and institutions</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Organize conferences and educational programs</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Support professional development and networking</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-orange-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600 mb-1">500+</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600 mb-1">25+</div>
                    <div className="text-sm text-gray-600">Years of Service</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600 mb-1">50+</div>
                    <div className="text-sm text-gray-600">Conferences Held</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600 mb-1">200+</div>
                    <div className="text-sm text-gray-600">Research Papers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
