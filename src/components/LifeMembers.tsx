
const LifeMembers = () => {
  const lifeMembers = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar Singh",
      designation: "Former Director, IARI",
      institution: "Indian Agricultural Research Institute, New Delhi",
      specialization: "Rice Breeding & Genetics",
      memberSince: "1998",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      designation: "Professor & Head",
      institution: "Punjab Agricultural University, Ludhiana",
      specialization: "Wheat Breeding",
      memberSince: "2000",
      image: "https://images.unsplash.com/photo-1494790108755-2616b6fa1b1e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Dr. Anil Kumar Patel",
      designation: "Principal Scientist",
      institution: "ICRISAT, Hyderabad",
      specialization: "Sorghum & M

illet Breeding",
      memberSince: "2001",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Dr. Meera Singh",
      designation: "Senior Scientist",
      institution: "University of Agricultural Sciences, Bangalore",
      specialization: "Vegetable Breeding",
      memberSince: "2003",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Dr. Suresh Kumar Gupta",
      designation: "Director",
      institution: "National Seed Research & Training Centre",
      specialization: "Seed Technology",
      memberSince: "2005",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Dr. Kavita Reddy",
      designation: "Professor",
      institution: "Acharya N.G. Ranga Agricultural University",
      specialization: "Cotton Breeding",
      memberSince: "2007",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Life Members</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Honoring our distinguished life members who have made significant contributions 
            to plant breeding science and the growth of ISPB.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">250+</div>
            <div className="text-gray-600">Total Life Members</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
            <div className="text-gray-600">Years of Service</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Institutions</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
            <div className="text-gray-600">Specializations</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
              <input
                type="text"
                placeholder="Enter member name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Institution</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Institutions</option>
                <option value="iari">IARI, New Delhi</option>
                <option value="pau">PAU, Ludhiana</option>
                <option value="uas">UAS, Bangalore</option>
                <option value="icrisat">ICRISAT, Hyderabad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Specialization</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Specializations</option>
                <option value="rice">Rice Breeding</option>
                <option value="wheat">Wheat Breeding</option>
                <option value="cotton">Cotton Breeding</option>
                <option value="vegetables">Vegetable Breeding</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-6">
          {lifeMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
                    />
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-green-600 font-semibold mb-1">{member.designation}</p>
                    <p className="text-gray-600 mb-2">{member.institution}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {member.specialization}
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Member since {member.memberSince}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-4 md:mt-0">
                    <div className="flex flex-col space-y-2">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium text-center">
                        Life Member
                      </span>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        View Profile →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>

        {/* Become a Life Member CTA */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Become a Life Member</h2>
          <p className="text-lg mb-6 opacity-90">
            Join our distinguished community of plant breeding professionals and make a lasting impact.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Apply for Life Membership
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifeMembers;
