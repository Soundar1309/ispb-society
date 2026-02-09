
const Genesis = () => {
  return (
    <div className="min-h-screen py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Genesis</h1>
          <p className="text-lg text-gray-600">
            The origin and founding story of the Indian Society of Plant Breeders
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Beginning</h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              The plant breeders'  forum was inaugurated on February 26, 1995 and the forum was registered as per S. No. 191 of 1995 on 6.11.1995. A total of 110 breeders from Tamil Nadu Agricultural University, Sugarcane Breeding Institute, Central Institute for Cotton Research,  Institute of Forest Genetics and Tree Breeding and breeders from private companies and institutions and retired plant breeders joined the forum at the time of inauguration.
            </p>
            <p className="text-gray-700 pt-4 leading-relaxed text-justify">
              To extend the services of the forum from state level to national level, the members felt the need of changing its nomenclature to Indian Society of Plant Breeders (ISPB). The ISPB is functioning well under the leadership of its office bearers of the past and present.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Founding Vision</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The society was established with the vision to promote excellence in plant breeding research,
                education, and application. The founding members envisioned an organization that would:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Foster scientific research and innovation in Plant Breeding and Genetics.</li>
                <li>Provide a platform for knowledge sharing among researchers and practitioners</li>
                <li>Organize conferences, seminars, and training programs</li>
                <li>Publish scientific literature and research findings</li>
                <li>Strengthen collaboration between academia and industry</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Founding Members</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The society was founded by eminent plant breeders and scientists from premier institutions
                like:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Indian Agricultural Research Institute (IARI), New Delhi</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Punjab Agricultural University, Ludhiana</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">International Crops Research Institute for the Semi-Arid Tropics,Hyderabad</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">University of Agricultural Sciences, Bangalore</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">International Rice Research Institute,Philippines</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">ICAR-Sugarcane Breeding Institute,Coimbatore</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">ICAR-Central Institute For Cotton Research</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">ICAR-Indian Institute of Rice Research, Hyderabad</h4>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Historical Milestones</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900">1998 - Foundation</h4>
                  <p className="text-gray-700">
                    The Indian Society of Plant Breeders was officially established with the first
                    governing council comprising leading plant breeders from across the country.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900">2000 - First Conference</h4>
                  <p className="text-gray-700">
                    The inaugural conference was held in New Delhi, bringing together over 200
                    plant breeders, geneticists, and agricultural scientists.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900">2005 - Publication Launch</h4>
                  <p className="text-gray-700">
                    Launch of the society's first journal, providing a platform for publishing
                    cutting-edge research in plant breeding and genetics.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900">2010 - International Collaboration</h4>
                  <p className="text-gray-700">
                    Establishment of partnerships with international plant breeding societies
                    and research organizations to promote global knowledge exchange.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Legacy and Impact</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Over the years, ISPB has grown to become a premier professional society in India,
                contributing significantly to the advancement of plant breeding science. The society
                has played a crucial role in:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Training the next generation of plant breeders and geneticists</li>
                <li>Facilitating the development of improved crop varieties</li>
                <li>Promoting sustainable agricultural practices</li>
                <li>Strengthening India's food security through scientific innovation</li>
                <li>Building a strong network of plant breeding professionals across the country</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Genesis;
