import React from 'react';
import Header from './Header';
import Footer from './Footer';

const About = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Lightning Fast",
      description: "Built with modern technology stack for optimal performance and speed."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted data storage and regular backups."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "User Friendly",
      description: "Intuitive interface designed for easy navigation and quick learning."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Analytics & Reports",
      description: "Comprehensive reporting tools to track and analyze student data effectively."
    }
  ];

  const team = [
    {
      name: "Er. Yogendra Kumar",
      role: "Founder & CEO",
      image: "https://img.freepik.com/free-vector/young-man-with-glasses-avatar_1308-175763.jpg?t=st=1763543310~exp=1763546910~hmac=b07403ac663636d22a3f1cdef22627984ff71b6a28758a5a7de4ed6de2153852&w=1060"
    },
    {
      name: "Mr. Abhishek Kumar",
      role: "CTO",
      image: "https://img.freepik.com/free-vector/man-shows-gesture-great-idea_10045-637.jpg?t=st=1763543481~exp=1763547081~hmac=a16f7bd15f7004c78a763fb19ab7e102680296a0b3e75607d380c2fade54bc26&w=1480"
    },
    {
      name: "Er. Himanshu Mishra",
      role: "Lead Developer",
      image: "https://i.ibb.co/nqwVXxRw/IMG-20250421-113739-793.webp"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">About DataCollect</h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto animate-fade-in-up">
            Revolutionizing college management with innovative technology and user-centric design
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                Welcome to All Around Aid, your trusted partner for printing, ID card creation, and customized gift items in Basti and nearby cities including Ayodhya, Gorakhpur, Khalilabad, Padrauna, Kushinagar, Prayagraj (Allahabad), Siddharthnagar, Dumariyaganj, and Bansi.
                <br /><br />
                We specialize in School ID Cards, Acrylic ID Cards, PVC & Plastic ID Cards, School Ties, Belts, Badges, and Personalized Gifts such as Photo Frames, Mugs, Bottles, T-Shirts, and Keychains — all crafted with precision and premium quality.
                <br /><br />
                At All Around Aid, we blend creativity with technology to deliver printing solutions that reflect your identity — whether it’s for schools, offices, or personal gifts. Our mission is to make customization simple, stylish, and affordable for everyone.

                {/* At EduConnect, we believe in transforming the way educational institutions manage their data and operations. Our mission is to provide colleges with a powerful, yet simple-to-use platform that streamlines student management processes. */}
              </p>

              <h2 className=' text-xl text-gray-600 mb-6'>🎯 Why Choose Us:</h2>
              <p className="text-lg text-gray-600 mb-6">
                
                High-quality printing with durable materials
                <br />
                Fast and reliable delivery across Uttar Pradesh
                <br />
                Affordable pricing for bulk and single orders
                <br />
                Custom designs to match your brand or personal style
                {/* We're dedicated to helping educational institutions focus on what matters most - providing quality education - while we handle the administrative complexities. */}
              </p>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600">500+</div>
                  <div className="text-gray-600">Colleges</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600">50K+</div>
                  <div className="text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-up">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide cutting-edge features designed to make college management effortless
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to making education management easier
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border-1 border-gray-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-70 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-indigo-600 font-semibold">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;