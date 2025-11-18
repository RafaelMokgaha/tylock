
import React from 'react';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-blue-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-blue-500 after:shadow-[0_0_10px_theme(colors.blue.500)]">
        {children}
    </h2>
);

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6 border-b border-blue-500/20 pb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <div className="text-gray-400 space-y-3">{children}</div>
    </div>
);

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-blue-500/30 w-full max-w-4xl mx-auto">
      <SectionHeader>Privacy Policy</SectionHeader>
      <div className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString()}</div>
      <div>
        <PolicySection title="Introduction">
            <p>
                Welcome to Tylock Games. We are committed to protecting your privacy. This Privacy Policy explains how we handle and protect your information when you use our website. Since our service operates entirely on your local device without a central server, our data handling practices are unique.
            </p>
        </PolicySection>
        <PolicySection title="Information We Collect">
            <p>
                All data generated and used by this application is stored directly in your web browser's `localStorage` and `sessionStorage`. We do not have a server, and we do not transmit this data to any external database.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>Anonymous User Profile:</strong> Upon your first visit, we create a guest user profile (e.g., username, email) to personalize your experience. This is stored in `localStorage` on your computer and is necessary for functions like submitting requests.
                </li>
                <li>
                    <strong>Your Requests:</strong> Any game, online fix, or bypass requests you submit are saved in your browser's `localStorage`. This allows the admin (when they log in on the same browser) to view and approve them.
                </li>
                <li>
                    <strong>Messages:</strong> All messages sent to or received from the admin are also stored locally in `localStorage`.
                </li>
            </ul>
        </PolicySection>
        <PolicySection title="How We Use Your Information">
            <p>
                The information stored locally is used solely for the functionality of this website:
            </p>
             <ul className="list-disc list-inside space-y-2 pl-4">
                <li>To manage your game, online fix, and bypass requests.</li>
                <li>To facilitate communication between you and the admin.</li>
                <li>To maintain your session and preferences (e.g., preventing the welcome popup from showing repeatedly).</li>
            </ul>
            <p>
                We do not have access to this information unless we are using the same browser as you. The data does not leave your device.
            </p>
        </PolicySection>
        <PolicySection title="Third-Party Services (Advertising)">
            <p>
                We use Google AdSense to display advertisements on our website. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
                </li>
                <li>
                    Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Ads Settings</a>.
                </li>
            </ul>
             <p>
                For more information, please review <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google's advertising privacy policy</a>.
            </p>
        </PolicySection>
        <PolicySection title="Data Security and Control">
           <p>
                You have full control over your data. Since it is stored in your browser, you can delete it at any time by clearing your browser's cache and site data for our website. This will permanently remove your user profile, requests, and messages from your device.
           </p>
        </PolicySection>
        <PolicySection title="Changes to This Privacy Policy">
            <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
        </PolicySection>
        <PolicySection title="Contact Us">
            <p>
                If you have any questions about this Privacy Policy, you can contact us through the "Message" feature on the dashboard or by joining our Discord server (link available in the "Help" section).
            </p>
        </PolicySection>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
