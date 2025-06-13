
const OfficeBearers = () => {
  const officeBearers = [
    {
      name: "Dr. Rajesh Kumar",
      designation: "President",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      institution: "Indian Agricultural Research Institute, New Delhi"
    },
    {
      name: "Dr. Priya Sharma",
      designation: "Vice President",
      image: "https://images.unsplash.com/photo-1494790108755-2616b6fa1b1e?w=300&h=300&fit=crop&crop=face",
      institution: "Punjab Agricultural University, Ludhiana"
    },
    {
      name: "Dr. Anil Patel",
      designation: "Secretary",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      institution: "Tamil Nadu Agricultural University, Coimbatore"
    },
    {
      name: "Dr. Meera Singh",
      designation: "Treasurer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      institution: "University of Agricultural Sciences, Bangalore"
    },
    {
      name: "Dr. Suresh Gupta",
      designation: "Joint Secretary",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      institution: "Chaudhary Charan Singh University, Meerut"
    },
    {
      name: "Dr. Kavita Reddy",
      designation: "Executive Member",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300&h=300&fit=crop&crop=face",
      institution: "Acharya N.G. Ranga Agricultural University, Hyderabad"
    },
    {
      name: "Dr. Vikram Joshi",
      designation: "Executive Member",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
      institution: "Maharana Pratap University of Agriculture, Udaipur"
    },
    {
      name: "Dr. Sunita Yadav",
      designation: "Executive Member",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face",
      institution: "G.B. Pant University, Pantnagar"
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Office Bearers</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet our distinguished office bearers who lead the Indian Society of Plant Breeders 
            with their expertise and dedication to advancing plant breeding science.
          </p>
        </div>

        {/* Office Bearers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {officeBearers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="aspect-square">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-green-600 font-semibold mb-2">{member.designation}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.institution}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Office Bearers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For General Inquiries</h3>
              <p className="text-gray-600 mb-2">Contact our Secretary or President for general society matters, membership queries, and research collaborations.</p>
              <p className="text-green-600 font-medium">Email: secretary@ispb.org.in</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Financial Matters</h3>
              <p className="text-gray-600 mb-2">Contact our Treasurer for membership fees, conference registrations, and financial queries.</p>
              <p className="text-green-600 font-medium">Email: treasurer@ispb.org.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeBearers;
