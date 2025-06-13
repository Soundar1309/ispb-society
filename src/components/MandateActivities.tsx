
const MandateActivities = () => {
  const mandates = [
    {
      title: "Research Excellence",
      description: "Promote cutting-edge research in plant breeding, genetics, and biotechnology to address agricultural challenges and enhance crop productivity."
    },
    {
      title: "Knowledge Dissemination",
      description: "Facilitate the exchange of scientific knowledge through conferences, publications, workshops, and training programs."
    },
    {
      title: "Professional Development",
      description: "Support the professional growth of plant breeders and geneticists through continuing education and career advancement opportunities."
    },
    {
      title: "Industry Collaboration",
      description: "Foster partnerships between academic institutions, research organizations, and the agricultural industry to accelerate technology transfer."
    }
  ];

  const congresses = [
    {
      year: "2023",
      title: "15th ISPB Congress",
      theme: "Climate-Smart Plant Breeding for Sustainable Agriculture",
      location: "Hyderabad, India",
      participants: "450+ Delegates"
    },
    {
      year: "2021",
      title: "14th ISPB Congress",
      theme: "Genomics-Assisted Plant Breeding for Future Food Security",
      location: "Virtual Conference",
      participants: "600+ Delegates"
    },
    {
      year: "2019",
      title: "13th ISPB Congress",
      theme: "Plant Breeding Innovations for Nutritional Security",
      location: "Pune, India",
      participants: "520+ Delegates"
    },
    {
      year: "2017",
      title: "12th ISPB Congress",
      theme: "Harnessing Genetic Diversity for Crop Improvement",
      location: "Bhubaneswar, India",
      participants: "480+ Delegates"
    },
    {
      year: "2015",
      title: "11th ISPB Congress",
      theme: "Plant Breeding for Abiotic Stress Tolerance",
      location: "Coimbatore, India",
      participants: "400+ Delegates"
    },
    {
      year: "2013",
      title: "10th ISPB Congress",
      theme: "Molecular Plant Breeding: Challenges and Opportunities",
      location: "New Delhi, India",
      participants: "380+ Delegates"
    }
  ];

  const activities = [
    {
      category: "Annual Conferences",
      items: [
        "National Plant Breeding Congress",
        "Technical Sessions and Workshops",
        "Poster Presentations and Exhibitions",
        "Keynote Lectures by Eminent Scientists"
      ]
    },
    {
      category: "Training Programs",
      items: [
        "Molecular Breeding Techniques",
        "Statistical Methods in Plant Breeding",
        "Biotechnology Applications",
        "Intellectual Property Rights"
      ]
    },
    {
      category: "Publications",
      items: [
        "Journal of Plant Breeding and Genetics",
        "Conference Proceedings",
        "Technical Bulletins",
        "Newsletter and Updates"
      ]
    },
    {
      category: "Awards & Recognition",
      items: [
        "ISPB Excellence Award",
        "Young Scientist Award",
        "Best Research Paper Award",
        "Lifetime Achievement Award"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mandate & Activities</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our mission-driven activities and initiatives that advance plant breeding science 
            and support the professional community in India.
          </p>
        </div>

        {/* Mandate Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mandate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mandates.map((mandate, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-green-600 mb-3">{mandate.title}</h3>
                <p className="text-gray-700 leading-relaxed">{mandate.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Congress History */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">ISPB Congress History</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              {congresses.map((congress, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6 py-4">
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{congress.title}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {congress.year}
                    </span>
                  </div>
                  <p className="text-lg text-green-600 font-medium mb-2">{congress.theme}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📍 {congress.location}</span>
                    <span>👥 {congress.participants}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-green-600 mb-4">{activity.category}</h3>
                <ul className="space-y-2">
                  {activity.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg mb-6 opacity-90">
            Be part of India's premier plant breeding community and contribute to agricultural innovation.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Become a Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandateActivities;
