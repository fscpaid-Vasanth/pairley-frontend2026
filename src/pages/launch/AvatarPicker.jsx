import { motion } from 'framer-motion';
import { launchAvatars } from '../../data/launchAvatars';

export default function AvatarPicker({ value, onChange }) {
  return (
    <div className="launch-avatar-grid">
      {launchAvatars.map((avatar) => (
        <motion.button
          key={avatar.id}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(avatar.id)}
          className={`launch-avatar ${value === avatar.id ? 'launch-avatar--active' : ''}`}
          style={{ background: value === avatar.id ? avatar.gradient : undefined }}
        >
          <span className="launch-avatar__emoji">{avatar.emoji}</span>
          <span className="launch-avatar__label">{avatar.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
