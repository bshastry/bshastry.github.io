import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Database, Mail } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-max section-padding py-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center mb-4">
            <Shield size={32} className="text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>

          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-max section-padding py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            <div className="prose prose-lg max-w-none">

              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye size={24} className="mr-2 text-blue-600" />
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy describes how Bhargava Shastry ("I", "me", or "my") collects,
                  uses, and protects your information when you visit this personal portfolio website
                  (the "Service"). This policy applies to bshastry.github.io and any related services.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  As a security engineer, I am committed to protecting your privacy and being
                  transparent about data practices. This website is designed with privacy in mind.
                </p>
              </section>

              {/* Information Collection */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Database size={24} className="mr-2 text-blue-600" />
                  Information I Collect
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Information You Provide</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Contact information when you reach out via email or contact forms</li>
                  <li>Any messages or communications you send directly</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Basic web analytics (via GitHub Pages hosting)</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on the site</li>
                  <li>Referring websites</li>
                  <li>IP address (anonymized)</li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <p className="text-blue-800">
                    <strong>Note:</strong> This website is hosted on GitHub Pages and does not use
                    cookies, tracking pixels, or third-party analytics services beyond what GitHub
                    provides for basic site statistics.
                  </p>
                </div>
              </section>

              {/* How I Use Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How I Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>To respond to your inquiries and communications</li>
                  <li>To improve the website content and user experience</li>
                  <li>To understand how visitors interact with the site</li>
                  <li>To maintain the security and integrity of the website</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  I do not sell, trade, or otherwise transfer your personal information to third parties.
                  Information may only be shared in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>With your explicit consent</li>
                  <li>When required by law or legal process</li>
                  <li>To protect the rights, property, or safety of myself or others</li>
                </ul>
              </section>

              {/* Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As a security professional, I implement appropriate technical and organizational
                  measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>HTTPS encryption for all communications</li>
                  <li>Minimal data collection practices</li>
                  <li>Regular security reviews of the website</li>
                  <li>Secure hosting infrastructure via GitHub Pages</li>
                </ul>
              </section>

              {/* Third-Party Services */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This website may contain links to external sites and services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>GitHub:</strong> For hosting and version control</li>
                  <li><strong>Social Media:</strong> Links to LinkedIn, Twitter, and other platforms</li>
                  <li><strong>Academic Profiles:</strong> Links to Google Scholar, research publications</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  These third-party services have their own privacy policies, which I encourage you to review.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Request information about data I have collected about you</li>
                  <li>Request correction of inaccurate personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of any future communications</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail size={24} className="mr-2 text-blue-600" />
                  Contact Me
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or your personal information,
                  please contact me:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> Available through the contact form on this website
                  </p>
                  <p className="text-gray-700">
                    <strong>Response Time:</strong> I aim to respond within 48 hours
                  </p>
                </div>
              </section>

              {/* Updates */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  I may update this Privacy Policy from time to time. Any changes will be posted
                  on this page with an updated "Last updated" date. I encourage you to review
                  this policy periodically for any changes.
                </p>
              </section>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 mt-8">
                <p className="text-sm text-gray-500 text-center">
                  This privacy policy reflects my commitment to transparency and data protection
                  as a security professional. For technical questions about website security,
                  feel free to reach out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}