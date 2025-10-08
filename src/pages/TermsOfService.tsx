import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">
                📋 Terms of Service
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: October 8, 2025
              </p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using our background removal service, you accept and agree 
                to be bound by these Terms of Service and our Privacy Policy.
              </p>

              <h2>2. Service Description</h2>
              <p>
                We provide a free, web-based AI-powered background removal tool that processes 
                images locally in your browser. Our service includes:
              </p>
              <ul>
                <li>AI-powered automatic background removal</li>
                <li>Manual color picker background removal</li>
                <li>Batch processing capabilities</li>
                <li>Multiple export formats (PNG, JPG)</li>
              </ul>

              <h2>3. Acceptable Use</h2>
              <p>You agree to use our service only for lawful purposes. You may NOT:</p>
              <ul>
                <li>Process images containing illegal, harmful, or offensive content</li>
                <li>Use the service to infringe on others' intellectual property rights</li>
                <li>Attempt to reverse engineer or copy our AI algorithms</li>
                <li>Use automated tools to abuse or overload our service</li>
                <li>Process images without proper rights or permissions</li>
              </ul>

              <h2>4. Intellectual Property</h2>
              <p>
                <strong>Your Content:</strong> You retain all rights to images you process. 
                We do not claim ownership of your uploaded images.
              </p>
              <p>
                <strong>Our Service:</strong> The background removal algorithms, website design, 
                and service implementation are protected by intellectual property laws.
              </p>

              <h2>5. Service Availability</h2>
              <p>
                We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. 
                We reserve the right to:
              </p>
              <ul>
                <li>Perform maintenance and updates</li>
                <li>Modify or discontinue features</li>
                <li>Implement usage limitations if necessary</li>
              </ul>

              <h2>6. Disclaimer of Warranties</h2>
              <p>
                Our service is provided "as is" without warranties of any kind. While we strive 
                for high-quality results, we cannot guarantee perfect background removal for all images.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                We are not liable for any damages arising from:
              </p>
              <ul>
                <li>Use or inability to use our service</li>
                <li>Quality of background removal results</li>
                <li>Loss of data or images (though we don't store them)</li>
                <li>Business interruptions or lost profits</li>
              </ul>

              <h2>8. Commercial Use</h2>
              <p>
                You are free to use our service for commercial purposes, including:
              </p>
              <ul>
                <li>E-commerce product photography</li>
                <li>Marketing and advertising materials</li>
                <li>Professional design projects</li>
                <li>Social media content creation</li>
              </ul>

              <h2>9. Privacy and Data Processing</h2>
              <p>
                All image processing occurs locally in your browser. We do not upload, 
                store, or analyze your images on our servers. See our Privacy Policy for details.
              </p>

              <h2>10. Advertising</h2>
              <p>
                Our service is supported by contextual advertising. Ads are selected based on 
                content relevance, not your personal data.
              </p>

              <h2>11. Modifications to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of our service 
                after changes constitutes acceptance of the new terms.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These terms are governed by applicable international laws and regulations 
                regarding online services and data protection.
              </p>

              <h2>13. Contact Information</h2>
              <p>
                For questions about these terms, please contact:
                <br />
                Email: support@bgremover.com
              </p>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">✅ Free Forever Guarantee</h3>
                <p className="text-sm">
                  Our core background removal service will always remain free. 
                  No hidden fees, no subscription requirements, no usage limits.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;