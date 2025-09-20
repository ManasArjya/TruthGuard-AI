import SearchBar from '../components/SearchBar'
import FeaturedClaims from '../components/FeaturedClaims'
import StatsSection from '../components/StatsSection'
import { Shield, Users, FileSearch, AlertTriangle } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="text-center py-14 md:py-20 animate-fade-in">
        <div className="max-w-4xl mx-auto px-2">
          <div className="mb-6">
            <Shield className="mx-auto h-12 w-12 md:h-16 md:w-16 text-primary-600 mb-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Combat Misinformation with{' '}
            <span className="text-gradient">AI-Powered Truth</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Submit claims, URLs, or media files for instant AI-powered fact-checking. 
            Get detailed analysis, community insights, and take action with automated 
            verification requests.
          </p>
          
          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
          
          <div className="mt-6 md:mt-8 text-xs md:text-sm text-slate-500">
            Supports text claims, URLs, images, and videos
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          How TruthGuard AI Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <div className="card text-center group hover:shadow-lg hover-raise">
            <div className="mb-4">
              <FileSearch className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Submit & Analyze</h3>
            <p className="text-slate-600">
              Submit any claim, URL, image, or video. Our AI extracts content 
              using OCR and transcription, then analyzes it against verified sources.
            </p>
          </div>
          
          <div className="card text-center group hover:shadow-lg hover-raise">
            <div className="mb-4">
              <Users className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Community Discussion</h3>
            <p className="text-slate-600">
              Engage with others in fact-checking discussions. Vote on comments, 
              share evidence, and learn from verified experts in the field.
            </p>
          </div>
          
          <div className="card text-center group hover:shadow-lg hover-raise">
            <div className="mb-4">
              <AlertTriangle className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Take Action</h3>
            <p className="text-slate-600">
              For government-related claims, generate automated RTI requests 
              to seek official verification from relevant authorities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Claims */}
      <FeaturedClaims />

      {/* Call to Action */}
      <section className="py-12 md:py-16 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto px-2">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Ready to Fight Misinformation?
          </h2>
          <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8">
            Join thousands of users who trust TruthGuard AI to verify information 
            and promote truth in the digital age.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button className="btn-primary px-6 md:px-8 py-3 text-base md:text-lg">
              Start Fact-Checking
            </button>
            <button className="btn-secondary px-6 md:px-8 py-3 text-base md:text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}