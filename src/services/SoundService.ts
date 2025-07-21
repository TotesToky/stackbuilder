import Sound from 'react-native-sound';
import { SOUNDS } from '@/constants';

class SoundService {
  private sounds: { [key: string]: Sound } = {};
  private musicEnabled: boolean = true;
  private soundEnabled: boolean = true;

  constructor() {
    Sound.setCategory('Playback');
    this.initializeSounds();
  }

  private initializeSounds() {
    // Initialize drop sound
    this.sounds.drop = new Sound(SOUNDS.DROP, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load drop sound', error);
      }
    });

    // Initialize perfect sound
    this.sounds.perfect = new Sound(SOUNDS.PERFECT, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load perfect sound', error);
      }
    });

    // Initialize game over sound
    this.sounds.gameOver = new Sound(SOUNDS.GAME_OVER, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load game over sound', error);
      }
    });

    // Initialize background music
    this.sounds.backgroundMusic = new Sound(SOUNDS.BACKGROUND_MUSIC, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load background music', error);
      } else {
        this.sounds.backgroundMusic.setNumberOfLoops(-1);
      }
    });
  }

  playSound(soundName: string) {
    if (!this.soundEnabled) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.stop(() => {
        sound.play();
      });
    }
  }

  playMusic() {
    if (!this.musicEnabled) return;

    const music = this.sounds.backgroundMusic;
    if (music) {
      music.play();
    }
  }

  stopMusic() {
    const music = this.sounds.backgroundMusic;
    if (music) {
      music.stop();
    }
  }

  pauseMusic() {
    const music = this.sounds.backgroundMusic;
    if (music) {
      music.pause();
    }
  }

  resumeMusic() {
    if (!this.musicEnabled) return;

    const music = this.sounds.backgroundMusic;
    if (music) {
      music.play();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else {
      this.playMusic();
    }
  }

  release() {
    Object.values(this.sounds).forEach(sound => {
      sound.release();
    });
  }
}

export default new SoundService();