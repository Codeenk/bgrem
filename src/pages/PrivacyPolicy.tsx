import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">
                🔒 Privacy Policy
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: October 8, 2025
              </p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>1. Information We Collect</h2>
              <p>
                <strong>Images:</strong> All image processing happens directly in your browser. 
                We do not upload, store, or transmit your images to our servers.
              </p>
              <p>
                <strong>Analytics:</strong> We may collect anonymous usage statistics to improve our service, 
                including browser type, device information, and general usage patterns.
              </p>

              <h2>2. How We Use Your Information</h2>
              <ul>
                <li>Process images locally in your browser for background removal</li>
                <li>Improve our AI algorithms and user experience</li>
                <li>Provide technical support when requested</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Data Security</h2>
              <p>
                Your images never leave your device. All background removal processing 
                occurs locally in your browser using WebAssembly and JavaScript technologies. 
                This ensures maximum privacy and security for your content.
              </p>

              <h2>4. Third-Party Services</h2>
              <p>
                We may use third-party services for:
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> Anonymous usage statistics</li>
                <li><strong>Google AdSense:</strong> Contextual advertising</li>
                <li><strong>CDN Services:</strong> Fast content delivery</li>
              </ul>

              <h2>5. Cookies and Local Storage</h2>
              <p>
                We use minimal cookies and local storage for:
              </p>
              <ul>
                <li>Remembering your processing preferences</li>
                <li>Storing temporary processing data (cleared on page refresh)</li>
                <li>Analytics and advertising (with your consent)</li>
              </ul>

              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Use our service without creating an account</li>
                <li>Clear your browser data at any time</li>
                <li>Opt out of analytics tracking</li>
                <li>Contact us with privacy concerns</li>
              </ul>

              <h2>7. Children's Privacy</h2>
              <p>
                Our service is not directed to children under 13. We do not knowingly 
                collect personal information from children under 13.
              </p>

              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users 
                of any material changes by posting the new policy on this page.
              </p>

              <h2>9. Contact Information</h2>
              <p>
                For privacy-related questions or concerns, please contact us at:
                <br />
                Email: privacy@bgremover.com
              </p>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">🛡️ Privacy-First Design</h3>
                <p className="text-sm">
                  Unlike cloud-based competitors, our background remover processes all images 
                  locally in your browser. Your photos never touch our servers, ensuring 
                  complete privacy and security.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;