
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Membership = () => {
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching membership plans:', error);
        return;
      }

      setMembershipPlans(data || []);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registrationSteps = [
    {
      step: 1,
      title: "Fill Application Form",
      description: "Complete the online membership application form with your personal and professional details."
    },
    {
      step: 2,
      title: "Upload Documents",
      description: "Submit required documents as indicated below."
    },
    {
      step: 3,
      title: "Application Review",
      description: "Your application will be reviewed by the membership committee within 7-10 working days."
    },
    {
      step: 4,
      title: "Payment via Razorpay",
      description: "Make secure online payment using Razorpay payment gateway with multiple payment options."
    },
    {
      step: 5,
      title: "Membership Confirmation",
      description: "Receive your membership confirmation certificate via email."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading membership plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Membership</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Join the Indian Society of Plant Breeders and be part of India's premier
            plant breeding community. Connect, learn, and contribute to agricultural innovation.
          </p>
        </div>

        {/* Membership Types */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Membership Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {membershipPlans.map((plan, index) => (
              <div key={plan.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">₹{plan.price}</div>
                  <div className="text-sm sm:text-base text-gray-600">
                    {plan.duration_months > 0 ? `${plan.duration_months} months` : 'Lifetime'}
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => window.location.href = '/membership-application'}
                  className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Registration Process */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Registration Process</h2>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center mx-auto">
              {registrationSteps.map((step, index) => (
                <div key={index} className="text-center items-center flex flex-col justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-base sm:text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Required Documents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-1 text-center gap-6 sm:gap-8 justify-center">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-green-600 mb-4 text-center">For All Applicants (Documents to be uploaded)</h3>
              <ul className="space-y-3 text-center grid grid-cols-1 sm:grid-cols-2 items-center justify-center mb-6 sm:mb-8 ml-4">
                <li className="flex">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base">Recent passport-sized photograph</span>
                </li>
                <li className="flex">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base">Proof for educational qualification with specialization</span>
                </li>
              </ul>
            </div>
            {/* <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-green-600 mb-4">Additional Requirements</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base"><strong>Students:</strong> Bonafide student certificate</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base"><strong>Professionals:</strong> Experience certificate</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base"><strong>Life Members:</strong> Research publication list</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base">Two professional references</span>
                </li>
              </ul>
            </div> */}
          </div>
        </section>

        {/* Payment Information */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 text-white">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Secure Online Payment</h2>
              <p className="text-base sm:text-lg opacity-90">
                We use Razorpay for secure and convenient online payments
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl sm:text-2xl">💳</span>
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Credit/Debit Cards</h3>
                <p className="text-xs sm:text-sm opacity-90">All major cards accepted</p>
              </div>
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl sm:text-2xl">🏦</span>
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Net Banking</h3>
                <p className="text-xs sm:text-sm opacity-90">50+ banks supported</p>
              </div>
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl sm:text-2xl">📱</span>
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">UPI/Wallets</h3>
                <p className="text-xs sm:text-sm opacity-90">UPI, Paytm, PhonePe</p>
              </div>
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl sm:text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Secure</h3>
                <p className="text-xs sm:text-sm opacity-90">256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Need Help with Membership?</h2>
            <p className="text-gray-600 mb-6">
              Our membership team is here to assist you with any questions or concerns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-green-600 text-sm sm:text-base">ISPBtnau@gmail.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                <p className="text-gray-600 text-sm sm:text-base">Mon-Fri: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Membership;
