import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertTriangle, Mail } from 'lucide-react'

export default function TermsOfServicePage() {
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
            <Scale size={32} className="text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Terms of Service
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
                  <FileText size={24} className="mr-2 text-blue-600" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using this website (bshastry.github.io), you accept and agree to
                  be bound by the terms and provision of this agreement. This is the personal
                  portfolio website of Bhargava Shastry, Security Engineer at the Ethereum Foundation.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              {/* Use License */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of the materials on this
                  website for personal, non-commercial transitory viewing only. This is the grant
                  of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                  <li>attempt to decompile or reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  This license shall automatically terminate if you violate any of these restrictions
                  and may be terminated by me at any time. Upon terminating your viewing of these
                  materials or upon the termination of this license, you must destroy any downloaded
                  materials in your possession whether in electronic or printed format.
                </p>
              </section>

              {/* Content and Research */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Content and Research</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This website contains information about security research, software engineering,
                  and academic work. Please note:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Research content is provided for educational and informational purposes only</li>
                  <li>Security research information should not be used for malicious purposes</li>
                  <li>Code examples and technical content are provided "as is" without warranty</li>
                  <li>Always follow responsible disclosure practices when dealing with security vulnerabilities</li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle size={20} className="text-yellow-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-semibold">Important Notice</p>
                      <p className="text-yellow-700 mt-1">
                        Any security research or vulnerability information shared on this site is
                        intended for defensive and educational purposes. Misuse of this information
                        for malicious activities is strictly prohibited and may be illegal.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The materials on this website are provided on an 'as is' basis. I make no
                  warranties, expressed or implied, and hereby disclaim and negate all other
                  warranties including without limitation, implied warranties or conditions of
                  merchantability, fitness for a particular purpose, or non-infringement of
                  intellectual property or other violation of rights.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Further, I do not warrant or make any representations concerning the accuracy,
                  likely results, or reliability of the use of the materials on its website or
                  otherwise relating to such materials or on any sites linked to this site.
                </p>
              </section>

              {/* Limitations */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
                <p className="text-gray-700 leading-relaxed">
                  In no event shall Bhargava Shastry or his employers be liable for any damages
                  (including, without limitation, damages for loss of data or profit, or due to
                  business interruption) arising out of the use or inability to use the materials
                  on this website, even if I or my authorized representative has been notified
                  orally or in writing of the possibility of such damage. Because some jurisdictions
                  do not allow limitations on implied warranties, or limitations of liability for
                  consequential or incidental damages, these limitations may not apply to you.
                </p>
              </section>

              {/* Professional Disclaimer */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Disclaimer</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The views and opinions expressed on this website are my own and do not necessarily
                  reflect the official policy or position of the Ethereum Foundation or any other
                  organization I am affiliated with.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Any content related to security research, vulnerability disclosure, or technical
                  analysis represents my personal research and should not be attributed to my employers
                  unless explicitly stated otherwise.
                </p>
              </section>

              {/* Accuracy of Materials */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy of Materials</h2>
                <p className="text-gray-700 leading-relaxed">
                  The materials appearing on this website could include technical, typographical,
                  or photographic errors. I do not warrant that any of the materials on its website
                  are accurate, complete, or current. I may make changes to the materials contained
                  on its website at any time without notice. However, I do not make any commitment
                  to update the materials.
                </p>
              </section>

              {/* Links */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Links</h2>
                <p className="text-gray-700 leading-relaxed">
                  I have not reviewed all of the sites linked to this website and am not responsible
                  for the contents of any such linked site. The inclusion of any link does not imply
                  endorsement by me of the site. Use of any such linked website is at the user's own risk.
                </p>
              </section>

              {/* Modifications */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
                <p className="text-gray-700 leading-relaxed">
                  I may revise these terms of service for its website at any time without notice.
                  By using this website, you are agreeing to be bound by the then current version
                  of these terms of service.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the
                  laws of Germany and you irrevocably submit to the exclusive jurisdiction of the
                  courts in that State or location.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail size={24} className="mr-2 text-blue-600" />
                  Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact me:
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

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 mt-8">
                <p className="text-sm text-gray-500 text-center">
                  These terms of service are designed to protect both visitors and the content
                  creator while promoting responsible use of security research information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}