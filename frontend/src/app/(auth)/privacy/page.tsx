export const metadata = {
  title: "Privacy Policy | Csphere",
  description: "Learn how Csphere collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen w-full bg-gray-300 text-[#202A29] py-40 md:py-48">
      <div className="mx-auto max-w-3xl px-6 py-0">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-10">
          Last updated: 11/13/2025
        </p>

        <div className="space-y-8 leading-relaxed">
          <section>
            <p>
              Csphere is built with a focus on privacy, transparency, and user control.

            </p>
          </section>

          <section>
            <p>
              We do not collect, track, or monitor browsing activity outside of explicit user actions.

            </p>
          </section>

          <section>
            <p>
              When a user chooses to save a page, Csphere sends that page’s HTML and metadata to our backend so it can be summarized and made searchable in the user’s account.

            </p>
          </section>

          <section>
            
            <p>
              Csphere provides two methods of user authentication. The first is through the browser extension. Authentication is handled by Google OAuth using Google’s flow for identity. Csphere does not access Google account data beyond the authentication token provided by Google.
            </p>
          </section>

          <section>
            <p>
              The second option is through Csphere’s web application. Authentication is handled by Csphere’s backend using a user’s account credentials (username and password). All credentials are transmitted securely over HTTPS and are stored in encrypted form.  
            </p>
          </section>

          <section>
            <p>
              By installing or using the Csphere Chrome Extension and submitting information through it, you consent to the collection and use of your information in accordance with this Privacy Policy. Your use of the extension constitutes acceptance of these terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
