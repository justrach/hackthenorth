import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#c0a8f8] to-[#80e0b8] text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-extrabold mb-6 text-white">
            excus.us
          </h1>
          <p className="text-2xl mb-8 text-white">
            Elevate Your Event Experience
          </p>
          <p className="text-xl mb-12 text-white/80 max-w-2xl mx-auto">
            Connect with fellow hackers and conference attendees in real-time. 
            Collaborate, network, and make the most of your events.
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="bg-[#6880d0] text-white hover:bg-[#5670c0] transition-colors duration-300 text-lg px-8 py-4">
              Start Networking Now
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#6880d0]">Why Choose excus.us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Connections', icon: '🚀', description: 'Connect with attendees instantly, no matter where you are in the venue.' },
              { title: 'Smart Matching', icon: '🧠', description: 'Our AI-powered system suggests relevant connections based on your interests and goals.' },
              { title: 'Real-time Collaboration', icon: '👥', description: 'Share ideas, code snippets, and resources in real-time with other participants.' },
              { title: 'Event Schedule Integration', icon: '📅', description: 'Never miss a session with our integrated event schedule and reminders.' },
              { title: 'Post-Event Networking', icon: '🌐', description: 'Keep the conversation going even after the event ends.' },
              { title: 'Secure & Private', icon: '🔒', description: 'Your data and conversations are protected with state-of-the-art encryption.' },
            ].map((feature, index) => (
              <div key={index} className="bg-[#f0f0e8] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-[#6880d0]">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-[#6880d0]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Alex Chen', role: 'Software Engineer', quote: 'excus.us transformed my hackathon experience. I met my co-founder here!' },
              { name: 'Samantha Lee', role: 'UX Designer', quote: 'The smart matching feature helped me connect with the right people at every conference.' },
              { name: 'Michael Johnson', role: 'Startup Founder', quote: 'This platform is a game-changer for networking at tech events.' },
              { name: 'Emily Wong', role: 'Data Scientist', quote: 'I love how easy it is to share ideas and collaborate in real-time during events.' },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold text-[#6880d0]">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#f0f0e8] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-[#6880d0]">Ready to Transform Your Event Experience?</h2>
          <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
            Join thousands of hackers and conference-goers who are already networking smarter with excus.us.
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="bg-[#f070b8] text-white hover:bg-[#e060a8] transition-colors duration-300 text-lg px-8 py-4">
              Get Started for Free
            </Button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}