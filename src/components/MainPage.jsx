import React from "react";

const MainPage = () => {
    return (
        <div className="main-page p-6 md:p-12">
            {/* Hero Section */}
            <section className="hero text-center mb-12">
                <h1 className="text-4xl font-bold mb-2"> 📩</h1>
                <h2 className="text-xl text-gray-600 mb-6">
                    Your Temporary Email Address
                </h2>

                <p className="text-gray-500 mt-4">
                    Forget about spam, ads, hacking and bots. Keep your real inbox clean
                    with our secure disposable emails.
                </p>
            </section>



            {/* SEO Content */}
            <section className="seo-content mb-12">
                <h3 className="text-2xl font-semibold mb-3">
                    What is Disposable Temporary E-mail?
                </h3>
                <p className="mb-4 text-gray-700">
                    Disposable email is a free service that lets you receive messages at a
                    temporary address that auto-deletes after a short time. Also known as:
                    temp mail, 10 minute mail, burner mail, fake email, or trash-mail.
                    Perfect for registrations, forums, or any service requiring email.
                </p>
                <p className="text-gray-700">
                    With TempMail Pro, you stay safe from spam, trackers, and hackers
                    while keeping your personal inbox private.
                </p>
            </section>

            {/* Popular Articles */}
            {/* <section className="articles">
        <h3 className="text-2xl font-semibold mb-4">Popular Articles</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Private domains: How to get your own Temporary Email
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              How to receive SMS OTP verification online
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              The Tech Behind Disposable Emails
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Why you need a burner email for social media
            </a>
          </li>
        </ul>
      </section> */}
        </div>
    );
};

export default MainPage;
