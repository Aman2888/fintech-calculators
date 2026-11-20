import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Mail, MapPin, Send } from 'lucide-react';

interface ContactFormValues {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: '',
      email: '',
      topic: 'Calculator Feedback',
      message: '',
    },
  });

  useEffect(() => {
    document.title = 'Contact | CALCULATE';
  }, []);

  const onSubmit = () => {
    setSubmitted(true);
    reset();
  };

  return (
    <div className="bg-midnight-mesh min-h-screen text-white">
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-3">
          <div className="text-xs font-semibold text-[#B4F434]">Contact</div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Get in Touch with CALCULATE
          </h1>
          <p className="text-base text-slate-300 max-w-2xl">
            Have a question about a financial formula, want to suggest a new calculator, or
            noticed an edge case? Send us a message below.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 space-y-5">
            <h2 className="font-display text-lg font-bold text-white">Direct Channels</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#B4F434] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-white">Email Support</div>
                  <div className="text-slate-300">support@calculate.app</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-white">Office</div>
                  <div className="text-slate-300">
                    548 Market Street, San Francisco, CA 94104
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#12142D] rounded-2xl border border-white/12 p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#B4F434]/15 text-[#B4F434] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Message Received</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you for reaching out. Our team reviews all calculator feedback within one
                business day.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-200">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4F434]"
                    {...register('name', { required: 'Please enter your name' })}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-200">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4F434]"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-topic" className="block text-sm font-medium text-slate-200">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C1E] border border-white/15 text-sm text-white focus:outline-none focus:border-[#B4F434]"
                  {...register('topic')}
                >
                  <option value="Calculator Feedback">Calculator Feedback</option>
                  <option value="Formula Question">Formula Question</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Partnership Inquiry">Partnership Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-200">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Share details about your question or calculator idea..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4F434]"
                  {...register('message', {
                    required: 'Please write a brief message',
                    minLength: { value: 10, message: 'Message must be at least 10 characters' },
                  })}
                />
                {errors.message && (
                  <p className="text-xs text-red-400">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B4F434] hover:bg-[#a3e635] text-[#090A1A] text-sm font-bold transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
