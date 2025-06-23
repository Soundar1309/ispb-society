import President from "../assets/president.jpg";
import ChiefEditor from '../assets/ChiefEditor.jpg';
import Editor from '../assets/Editor.jpg';
import Editor1 from '../assets/Editor1.jpg';
import Secretary from '../assets/secretary.jpg';
import Treasurer from '../assets/treasurer.jpg';
import User from '../assets/user.png';
import Vicepresident from '../assets/Vicepresident.jpg';


const OfficeBearers = () => {
  const officeBearers = [
    {
      name: "Dr. R. Ravikesavan",
      designation: "President",
      image: President,
      institution: ""
    },
    {
      name: "Dr. S. Manickam",
      designation: "Vice President",
      image: Vicepresident,
      institution: ""
    },
    {
      name: "Dr. R. Pushpam",
      designation: "Secretary",
      image: Secretary,
      institution: "Tamil Nadu Agricultural University, Coimbatore"
    },
    {
      name: "Dr. A. Subramanian	",
      designation: "Chief Editor",
      image: ChiefEditor,
      institution: "University of Agricultural Sciences, Bangalore"
    },
    {
      name: "Dr. A. Manivannan",
      designation: "Editor",
      image: Editor,
      institution: "Chaudhary Charan Singh University, Meerut"
    },
    {
      name: "Dr. R. Suresh",
      designation: "Editor",
      image: Editor1,
      institution: "Acharya N.G. Ranga Agricultural University, Hyderabad"
    },
    {
      name: "Dr. P. Shanthi",
      designation: "Treasurer",
      image: Treasurer,
      institution: "Maharana Pratap University of Agriculture, Udaipur"
    },
    {
      name: "Dr. S.R.Sreerangasamy",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. S. Sivakumar",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. N. Manivannan",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. R. Saraswathi",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. R. Kalaiyarasi",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. D. Kumaresan",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. K. Iyanar",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. S. Sheelamary",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. N. Premalatha",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. D. Kavithamani",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. Asish K Binodh",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    },
    {
      name: "Dr. A.Thanga Hemavathy",
      designation: "Executive Committee Member",
      image: User,
      institution: ""
    }  
  ];

  // Split office bearers
  const mainBearers = officeBearers.filter(
    member => member.designation !== "Executive Committee Member"
  );
  const executiveCommittee = officeBearers.filter(
    member => member.designation === "Executive Committee Member"
  );

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

        {/* Main Office Bearers Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {mainBearers.map((member, index) => (
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
        </div>

        {/* Executive Committee Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Executive Committee Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {executiveCommittee.map((member, index) => (
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
