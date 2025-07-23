import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

export default function CommunityCTA() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-8 px-4">
      <div className="bg-gradient-primary rounded-2xl shadow-elegant p-6 max-w-xl w-full flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-primary-foreground">Join Our Student Community!</h2>
        <p className="text-primary-foreground/90 mb-4 text-base md:text-lg">
          Join our WhatsApp group for exclusive deals and the latest events at Durham — Be the first to know!
        </p>
        <Button 
          asChild
          variant="glassmorphism"
          size="lg"
          className="inline-flex items-center gap-2 hover:scale-105 transition-all duration-300"
        >
          <a
            href="https://chat.whatsapp.com/HepNMq2g9W63ruiYBQQSvc?mode=r_t"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} />
            Join WhatsApp Community
          </a>
        </Button>
      </div>
    </section>
  );
}