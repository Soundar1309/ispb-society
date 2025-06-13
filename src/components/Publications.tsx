
const Publications = () => {
  const journals = [
    {
      title: "Journal of Plant Breeding and Genetics",
      issn: "ISSN: 2348-9138",
      frequency: "Quarterly",
      description: "Premier peer-reviewed journal publishing original research in plant breeding, genetics, and biotechnology.",
      impact: "Impact Factor: 2.45",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop"
    },
    {
      title: "ISPB Newsletter",
      issn: "ISSN: 2349-8765",
      frequency: "Bi-annual",
      description: "Society newsletter featuring member updates, research highlights, and industry news.",
      impact: "Open Access",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop"
    },
    {
      title: "Advances in Plant Breeding",
      issn: "ISSN: 2350-1234",
      frequency: "Annual",
      description: "Special issue journal focusing on cutting-edge advances and future directions in plant breeding.",
      impact: "Scopus Indexed",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop"
    }
  ];

  const proceedings = [
    {
      year: "2023",
      title: "15th ISPB Congress Proceedings",
      theme: "Climate-Smart Plant Breeding for Sustainable Agriculture",
      pages: "485 pages",
      papers: "125 research papers",
      downloadLink: "#"
    },
    {
      year: "2021",
      title: "14th ISPB Congress Proceedings",
      theme: "Genomics-Assisted Plant Breeding for Future Food Security",
      pages: "520 pages",
      papers: "140 research papers",
      downloadLink: "#"
    },
    {
      year: "2019",
      title: "13th ISPB Congress Proceedings",
      theme: "Plant Breeding Innovations for Nutritional Security",
      pages: "460 pages",
      papers: "118 research papers",
      downloadLink: "#"
    },
    {
      year: "2017",
      title: "12th ISPB Congress Proceedings",
      theme: "Harnessing Genetic Diversity for Crop Improvement",
      pages: "420 pages",
      papers: "105 research papers",
      downloadLink: "#"
    }
  ];

  const specialPublications = [
    {
      title: "Plant Breeding Techniques Manual",
      type: "Technical Guide",
      year: "2023",
      description: "Comprehensive manual covering classical and modern plant breeding techniques."
    },
    {
      title: "Molecular Markers in Plant Breeding",
      type: "Handbook",
      year: "2022",
      description: "Practical guide to the application of molecular markers in breeding programs."
    },
    {
      title: "Statistical Methods for Plant Breeders",
      type: "Reference Book",
      year: "2021",
      description: "Essential statistical tools and methods for plant breeding research and analysis."
    },
    {
      title: "Intellectual Property Rights in Plant Breeding",
      type: "Guide",
      year: "2020",
      description: "Comprehensive guide to IPR issues, plant variety protection, and patenting in plant breeding."
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Publications</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of journals, proceedings, and special publications 
            that advance plant breeding science and knowledge dissemination.
          </p>
        </div>

        {/* Journals Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Journals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journals.map((journal, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={journal.image}
                  alt={journal.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{journal.title}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-green-600 font-medium">{journal.issn}</span>
                    <span className="text-sm text-gray-600">{journal.frequency}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">{journal.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {journal.impact}
                    </span>
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                      View Issues →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proceedings Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conference Proceedings</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              {proceedings.map((proceeding, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6 py-4">
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{proceeding.title}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {proceeding.year}
                    </span>
                  </div>
                  <p className="text-lg text-green-600 font-medium mb-3">{proceeding.theme}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <span>📄 {proceeding.pages}</span>
                    <span>📝 {proceeding.papers}</span>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Special Publications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Special Publications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialPublications.map((publication, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{publication.title}</h3>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                    {publication.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{publication.year}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{publication.description}</p>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                  Request Copy →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Submission Guidelines */}
        <section>
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Submit Your Research</h2>
              <p className="text-lg opacity-90">
                Contribute to the advancement of plant breeding science by publishing with ISPB.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-semibold mb-2">Author Guidelines</h3>
                <p className="text-sm opacity-90">Review submission requirements and formatting guidelines</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold mb-2">Peer Review</h3>
                <p className="text-sm opacity-90">Rigorous peer review process ensuring quality publications</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="font-semibold mb-2">Open Access</h3>
                <p className="text-sm opacity-90">Wide dissemination through open access publishing options</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Submit Manuscript
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Publications;
