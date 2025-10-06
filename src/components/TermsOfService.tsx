
const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the Indian Society of Plant Breeders (ISPB) website and services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Membership Terms</h2>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Eligibility</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Open to professionals in Plant Breeding and related fields</li>
                <li>Accurate information must be provided during registration</li>
                <li>Users must be 18 years or older</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Membership Types</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Lifetime memberships are renewed annually for administrative purposes</li>
                <li>Member codes (LM-XXX) are assigned upon successful payment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Payment Terms</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>All fees are payable in Indian Rupees (INR)</li>
                <li>Payment processing is handled through secure third-party services</li>
                <li>Membership fees are non-transferable and non-refundable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintain confidentiality of your account credentials</li>
                <li>Provide accurate and up-to-date information</li>
                <li>Use the services for lawful purposes only</li>
                <li>Respect intellectual property rights</li>
                <li>Not engage in any disruptive or harmful activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on this website, including text, graphics, logos, and software, is the property of ISPB or its content suppliers and is protected by copyright laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please refer to our privacy policy for information on how we collect, use, and protect your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                ISPB shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the website or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-4">
                ISPB reserves the right to terminate or suspend access to the services at any time, with or without cause, with or without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                ISPB reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on the website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> secretary@ispb.org.in<br />
                  <strong>Address:</strong> Centre for Plant Breeding & Genetics, Tamil Nadu Agricultural University, Coimbatore, Tamil Nadu-641003, India
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
