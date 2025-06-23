
const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                The Indian Society of Plant Breeders (ISPB) website uses cookies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Remember your login status and preferences</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve website functionality and user experience</li>
                <li>Ensure website security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies help us remember your login status and keep your session secure when you're logged into your account.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Functional Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies allow the website to remember choices you make and provide enhanced, more personal features.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may use third-party services that set cookies on our website, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Payment processors (for secure transactions)</li>
                <li>Analytics services (to understand website usage)</li>
                <li>Authentication services (for secure login)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in various ways:
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                Most web browsers allow you to control cookies through their settings. You can usually find cookie settings in the 'options' or 'preferences' menu of your browser.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Cookie Deletion</h3>
              <p className="text-gray-700 mb-4">
                You can delete cookies that have already been set. However, please note that deleting cookies may affect your user experience on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Impact of Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                If you choose to disable cookies, some features of our website may not function properly:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You may need to log in each time you visit</li>
                <li>Certain preferences may not be saved</li>
                <li>Some interactive features may not work correctly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> ispbtnau@gmail.com<br />
                  <strong>Phone:</strong> +91 94886 17091<br />
                  <strong>Address:</strong> Centre for Plant Breeding & Genetics, Tamil Nadu Agricultural University, Coimbatore, Tamil Nadu-03, India
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
