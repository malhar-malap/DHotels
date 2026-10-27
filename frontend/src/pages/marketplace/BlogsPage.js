import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiArrowRight, FiMapPin, FiActivity, FiLayers } from 'react-icons/fi';
import Seo from '../../components/common/Seo';

const BlogsPage = () => {
  const blogPosts = [
    {
      title: "Hospitals for Sale in Maharashtra: Regional Acquisition Overview",
      link: "/hospitals-for-sale-maharashtra",
      description: "Analyze key considerations under the Maharashtra Nursing Homes Registration Act and regional demand across Mumbai, Pune, and Nagpur.",
      category: "Hospitals",
      location: "Maharashtra",
      readTime: "5 mins read",
      image: "/images/blogs/Hospital%20Acquisition%20and%20Healthcare%20Businesses%20for%20Sale%20in%20Maharashtra.jpg"
    },
    {
      title: "Pharma Companies and Manufacturing Plants in Maharashtra",
      link: "/pharma-companies-for-sale-maharashtra",
      description: "Explore pharmaceutical industrial clusters, MIDC leasehold transfer rules, and environmental regulations for bulk drug and formulation setups.",
      category: "Pharma",
      location: "Maharashtra",
      readTime: "6 mins read",
      image: "/images/blogs/Pharma%20Companies%20for%20Sale%20in%20Maharashtra.jpg"
    },
    {
      title: "Hospital Business Opportunities and Clinical Acquisitions in Bangalore",
      link: "/hospitals-for-sale-bangalore",
      description: "An evaluation of the Bangalore private health sector, KPME registration guidelines, and medical tourism demands in urban tech corridors.",
      category: "Hospitals",
      location: "Bangalore",
      readTime: "4 mins read",
      image: "/images/blogs/Hospitals%20for%20Sale%20in%20Bangalore.jpg"
    },
    {
      title: "Hospital and Clinical Space Investment and Sales in Delhi NCR",
      link: "/hospitals-for-sale-delhi",
      description: "Understand structural safety guidelines, Delhi Nursing Homes Registration Act updates, and DDA leasehold terms for capital acquisitions.",
      category: "Hospitals",
      location: "Delhi NCR",
      readTime: "5 mins read",
      image: "/images/blogs/Hospitals%20for%20Sale%20in%20Delhi%20NCR.jpg"
    },
    {
      title: "Clinics and Private Hospital Acquisitions in Pune",
      link: "/hospitals-for-sale-pune",
      description: "A specialized overview of Pune's local municipal certifications (PMC/PCMC), zoning permissions, and healthcare demography shifts.",
      category: "Hospitals",
      location: "Pune",
      readTime: "4 mins read",
      image: "/images/blogs/Hospitals%20for%20Sale%20in%20Pune.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-mesh bg-gray-900 text-gray-100 relative overflow-hidden">
      <Seo
        title="Blogs & Research | Healthcare Business Acquisitions"
        description="Read our industry insights, guides, and regional healthcare market reviews on hospitals and pharma manufacturing acquisitions across India."
        path="/blogs"
      />
      {/* Background Lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#d8572a]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <div className="border-b border-white/5 bg-gray-950/20 backdrop-blur-sm py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-bold text-primary-400 mb-4 tracking-wider uppercase">
            <FiBookOpen className="w-3.5 h-3.5" /> DHAcquisitions Journal
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
            Blogs & <span className="text-gradient">Market Research</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed mt-2">
            Stay informed with our regional reports, regulatory overviews, and strategic guidelines for hospital, clinical, and pharmaceutical factory acquisitions in India.
          </p>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Link
              key={index}
              to={post.link}
              className="group relative flex flex-col bg-gray-950/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/20 hover:-translate-y-1.5 transition-all duration-500"
            >
              {/* Cover Image */}
              <div className="h-48 bg-gray-900 overflow-hidden border-b border-white/5 relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-90" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2 py-0.5 bg-primary-500/90 text-white text-[8px] font-black uppercase tracking-wider rounded-full shadow-lg">
                    {post.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="text-[10px] text-gray-300 font-bold bg-gray-950/80 px-2 py-0.5 rounded backdrop-blur-sm">{post.readTime}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FiMapPin className="w-3.5 h-3.5 text-primary-500/80" />
                    <span>{post.location}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-100 text-base group-hover:text-primary-400 transition-colors duration-300 line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end text-xs font-bold text-primary-400 group-hover:text-primary-300 transition-colors gap-1">
                  Read Article <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
