import { Search, Users, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import './HowItWorksSteps.css';

const STEPS = [
  {
    num: '1',
    icon: Search,
    title: 'Discover Deals',
    description: 'Browse amazing deals from nearby local shops.',
    colorClass: 'how-it-works-steps__badge--primary',
  },
  {
    num: '2',
    icon: Users,
    title: 'Join & Invite',
    description: 'Join the deal and invite others to reach the minimum threshold.',
    colorClass: 'how-it-works-steps__badge--success',
  },
  {
    num: '3',
    icon: Gift,
    title: 'Unlock & Save',
    description: 'Once the group goal is reached, everyone gets the best price!',
    colorClass: 'how-it-works-steps__badge--accent',
  },
];

export default function HowItWorksSteps() {
  return (
    <div className="how-it-works-steps">
      <div className="how-it-works-steps__flex">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="how-it-works-steps__node-wrapper">
              <motion.div
                className="how-it-works-steps__node text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className={`how-it-works-steps__icon-circle ${step.colorClass}`}>
                  <Icon size={26} />
                  <span className="how-it-works-steps__step-num">{step.num}</span>
                </div>
                <h3 className="how-it-works-steps__title">{step.title}</h3>
                <p className="how-it-works-steps__desc text-xs text-muted max-w-[200px]">{step.description}</p>
              </motion.div>
              
              {idx < STEPS.length - 1 && (
                <div className="how-it-works-steps__arrow-line hide-mobile">
                  <div className="how-it-works-steps__dotted" />
                  <span className="how-it-works-steps__arrow-head">➡️</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
