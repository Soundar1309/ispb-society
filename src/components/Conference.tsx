
const Conference = () => {
  const upcomingConferences = [
    {
      id: 1,
      title: "16th ISPB Congress 2025",
      theme: "Digital Plant Breeding: AI and Machine Learning in Crop Improvement",
      date: "March 15-17, 2025",
      location: "Chennai, India",
      venue: "Chennai Trade Centre",
      registrationDeadline: "February 15, 2025",
      status: "registration-open",
      description: "Join leading plant breeders and geneticists to explore cutting-edge AI and ML applications in modern plant breeding programs."
    }
  ];

  const pastConferences = [
    {
      id: 1,
      title: "15th ISPB Congress 2023",
      theme: "Climate-Smart Plant Breeding for Sustainable Agriculture",
      date: "November 20-22, 2023",
      location: "Hyderabad, India",
      participants: "450+ Delegates",
      papers: "125 Research Papers",
      proceedings: "Available for Download"
    },
    {
      id: 2,
      title: "14th ISPB Congress 2021",
      theme: "Genomics-Assisted Plant Breeding for Future Food Security",
      date: "December 10-12, 2021",
      location: "Virtual Conference",
      participants: "600+ Delegates",
      papers: "140 Research Papers",
      proceedings: "Available for Download"
    },
    {
      id: 3,
      title: "13th ISPB Congress 2019",
      theme: "Plant Breeding Innovations for Nutritional Security",
      date: "October 25-27, 2019",
      location: "Pune, India",
      participants: "520+ Delegates",
      papers: "118 Research Papers",
      proceedings: "Available for Download"
    },
    {
      id: 4,
      title: "12th ISPB Congress 2017",
      theme: "Harnessing Genetic Diversity for Crop Improvement",
      date: "September 18-20, 2017",
      location: "Bhubaneswar, India",
      participants: "480+ Delegates",
      papers: "105 Research Papers",
      proceedings: "Available for Download"
    }
  ];

  const workshops = [
    {
      title: "Molecular Breeding Techniques Workshop",
      date: "January 20-21, 2025",
      location: "IARI, New Delhi",
      duration: "2 Days",
      fee: "₹2,500"
    },
    {
      title: "Statistical Methods in Plant Breeding",
      date: "February 10-12, 2025",
      location: "PAU, Ludhiana",
      duration: "3 Days",
      fee: "₹3,000"
    },
    {
      title: "Genomics and Bioinformatics Training",
      date: "March 5-7, 2025",
      location: "UAS, Bangalore",
      duration: "3 Days",
      fee: "₹3,500"
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Conferences & Events</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our upcoming conferences, workshops, and past events that bring together 
            the plant breeding community for knowledge sharing and networking.
          </p>
        </div>

        {/* Upcoming Conferences */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Conferences</h2>
          <div className="space-y-8">
            {upcomingConferences.map((conference) => (
              <div key={conference.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{conference.title}</h3>
                      <p className="text-lg opacity-90">{conference.theme}</p>
                    </div>
                    <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                      Registration Open
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📅 Date & Time</h4>
                      <p className="text-gray-700">{conference.date}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📍 Location</h4>
                      <p className="text-gray-700">{conference.location}</p>
                      <p className="text-gray-600 text-sm">{conference.venue}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">⏰ Registration Deadline</h4>
                      <p className="text-gray-700">{conference.registrationDeadline}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">{conference.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Register Now
                    </button>
                    <button className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                      View Details
                    </button>
                    <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      Download Brochure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workshops & Training */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Workshops</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workshops.map((workshop, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{workshop.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600"><strong>Date:</strong> {workshop.date}</p>
                  <p className="text-gray-600"><strong>Location:</strong> {workshop.location}</p>
                  <p className="text-gray-600"><strong>Duration:</strong> {workshop.duration}</p>
                  <p className="text-green-600 font-semibold"><strong>Fee:</strong> {workshop.fee}</p>
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Register
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Past Conferences */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Past Conferences</h2>
          <div className="space-y-6">
            {pastConferences.map((conference) => (
              <div key={conference.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-grow mb-4 lg:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{conference.title}</h3>
                    <p className="text-green-600 font-medium mb-2">{conference.theme}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {conference.date}</span>
                      <span>📍 {conference.location}</span>
                      <span>👥 {conference.participants}</span>
                      <span>📝 {conference.papers}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium text-center">
                      {conference.proceedings}
                    </span>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      View Proceedings →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call for Papers */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Call for Papers - 16th ISPB Congress 2025</h2>
          <p className="text-lg mb-6 opacity-90">
            Submit your research abstracts and be part of India's premier plant breeding conference.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Abstract Submission</h3>
              <p className="text-sm opacity-90">Deadline: January 31, 2025</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Full Paper Submission</h3>
              <p className="text-sm opacity-90">Deadline: February 28, 2025</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Poster Presentation</h3>
              <p className="text-sm opacity-90">On-site registration available</p>
            </div>
          </div>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Submit Abstract
          </button>
        </div>
      </div>
    </div>
  );
};

export default Conference;
