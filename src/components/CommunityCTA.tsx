import { Button } from './ui/button';

export default function CommunityCTA() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-8 px-4">
      <div className="bg-gradient-primary rounded-2xl shadow-elegant p-6 max-w-xl w-full flex flex-col items-center text-center">
        <img
          src="/image-uploads/whatsapp-logo.png"
          alt="WhatsApp"
          className="w-12 h-12 mb-4"
        />
        <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Join our WhatsApp community</h2>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="inline-flex items-center gap-2 hover:scale-105 transition-all duration-300 bg-white/10 text-primary-foreground border-white/20 hover:bg-white/20"
        >
          <a
            href="https://chat.whatsapp.com/HepNMq2g9W63ruiYBQQSvc?mode=r_t"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join our WhatsApp community
          </a>
        </Button>
      </div>
    </section>
  );
}