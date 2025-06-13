
const ContactUs = () => {
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get in touch with the Indian Society of Plant Breeders. We're here to help with 
            membership queries, conference information, and general inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="membership">Membership Inquiry</option>
                  <option value="conference">Conference Information</option>
                  <option value="publication">Publication Submission</option>
                  <option value="general">General Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Address */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Office Address</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Headquarters</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Indian Society of Plant Breeders<br />
                    Division of Genetics<br />
                    Indian Agricultural Research Institute<br />
                    New Delhi - 110012, India
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">📞</span>
                    </div>
                    <span className="text-gray-700">+91-11-2584-0000</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">📧</span>
                    </div>
                    <span className="text-gray-700">info@ispb.org.in</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">🌐</span>
                    </div>
                    <span className="text-gray-700">www.ispb.org.in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Contacts</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Membership Queries</h3>
                  <p className="text-sm text-gray-600 mb-2">For membership applications and renewals</p>
                  <p className="text-green-600 font-medium">membership@ispb.org.in</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Conference Registration</h3>
                  <p className="text-sm text-gray-600 mb-2">For conference and event registration</p>
                  <p className="text-green-600 font-medium">conference@ispb.org.in</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Publication Submissions</h3>
                  <p className="text-sm text-gray-600 mb-2">For journal and publication submissions</p>
                  <p className="text-green-600 font-medium">publications@ispb.org.in</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">General Inquiries</h3>
                  <p className="text-sm text-gray-600 mb-2">For general questions and support</p>
                  <p className="text-green-600 font-medium">info@ispb.org.in</p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Office Hours</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-medium text-red-600">Closed</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Office hours may vary during national holidays and conference periods. 
                  Please call ahead to confirm availability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Additional Info */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
          <p className="text-lg mb-6 opacity-90">
            Follow us on social media for the latest updates, news, and announcements.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
              <span className="text-xl">📘</span>
            </a>
            <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
              <span className="text-xl">🐦</span>
            </a>
            <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
              <span className="text-xl">💼</span>
            </a>
            <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
              <span className="text-xl">📧</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
