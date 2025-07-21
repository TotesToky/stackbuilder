import SQLite from 'react-native-sqlite-storage';
import { GameStats, UserSettings, Skin } from '@/types';
import { SKINS } from '@/constants';

SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'StackBuilder.db',
        location: 'default',
      });


      await this.createTables();
      await this.initializeDefaultData();
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.db = null;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    try {
      const createUserSettingsTable = `
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY,
          sound_enabled INTEGER DEFAULT 1,
          music_enabled INTEGER DEFAULT 1,
          vibration_enabled INTEGER DEFAULT 1,
          selected_skin TEXT DEFAULT 'default',
          ads_enabled INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createGameStatsTable = `
        CREATE TABLE IF NOT EXISTS game_stats (
          id INTEGER PRIMARY KEY,
          games_played INTEGER DEFAULT 0,
          total_score INTEGER DEFAULT 0,
          high_score INTEGER DEFAULT 0,
          perfect_hits INTEGER DEFAULT 0,
          average_score REAL DEFAULT 0,
          best_combo INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createSkinsTable = `
        CREATE TABLE IF NOT EXISTS skins (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          colors TEXT NOT NULL,
          price INTEGER NOT NULL,
          unlocked INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createGameSessionsTable = `
        CREATE TABLE IF NOT EXISTS game_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          score INTEGER NOT NULL,
          level INTEGER NOT NULL,
          perfect_hits INTEGER DEFAULT 0,
          combo INTEGER DEFAULT 0,
          duration INTEGER DEFAULT 0,
          skin_used TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await this.db.executeSql(createUserSettingsTable);
      await this.db.executeSql(createGameStatsTable);
      await this.db.executeSql(createSkinsTable);
      await this.db.executeSql(createGameSessionsTable);
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  private async initializeDefaultData(): Promise<void> {
    if (!this.db) return;

    try {
      // Vérifie si les paramètres utilisateur existent
      const settingsResult = await this.db.executeSql('SELECT COUNT(*) as count FROM user_settings');
      if (settingsResult[0].rows.item(0).count === 0) {
        await this.db.executeSql(`
          INSERT INTO user_settings (sound_enabled, music_enabled, vibration_enabled, selected_skin, ads_enabled)
          VALUES (1, 1, 1, 'default', 1)
        `);
      }

      // Vérifie si les statistiques existent
      const statsResult = await this.db.executeSql('SELECT COUNT(*) as count FROM game_stats');
      if (statsResult[0].rows.item(0).count === 0) {
        await this.db.executeSql(`
          INSERT INTO game_stats (games_played, total_score, high_score, perfect_hits, average_score, best_combo)
          VALUES (0, 0, 0, 0, 0, 0)
        `);
      }

      // Vérifie si les skins existent
      const skinsResult = await this.db.executeSql('SELECT COUNT(*) as count FROM skins');
      if (skinsResult[0].rows.item(0).count === 0) {
        for (const skin of SKINS) {
          await this.db.executeSql(`
            INSERT INTO skins (id, name, colors, price, unlocked)
            VALUES (?, ?, ?, ?, ?)
          `, [skin.id, skin.name, JSON.stringify(skin.colors), skin.price, skin.unlocked ? 1 : 0]);
        }
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  // Méthodes pour les paramètres utilisateur
  async getUserSettings(): Promise<UserSettings> {
    if (!this.db) {
      return {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        selectedSkin: 'default',
        adsEnabled: true,
      };
    }

    try {
      const result = await this.db.executeSql('SELECT * FROM user_settings LIMIT 1');
      if (result[0].rows.length === 0) {
        return {
          soundEnabled: true,
          musicEnabled: true,
          vibrationEnabled: true,
          selectedSkin: 'default',
          adsEnabled: true,
        };
      }

      const row = result[0].rows.item(0);
      return {
        soundEnabled: Boolean(row.sound_enabled),
        musicEnabled: Boolean(row.music_enabled),
        vibrationEnabled: Boolean(row.vibration_enabled),
        selectedSkin: row.selected_skin,
        adsEnabled: Boolean(row.ads_enabled),
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        selectedSkin: 'default',
        adsEnabled: true,
      };
    }
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    if (!this.db) return;

    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (settings.soundEnabled !== undefined) {
        updates.push('sound_enabled = ?');
        values.push(settings.soundEnabled ? 1 : 0);
      }
      if (settings.musicEnabled !== undefined) {
        updates.push('music_enabled = ?');
        values.push(settings.musicEnabled ? 1 : 0);
      }
      if (settings.vibrationEnabled !== undefined) {
        updates.push('vibration_enabled = ?');
        values.push(settings.vibrationEnabled ? 1 : 0);
      }
      if (settings.selectedSkin !== undefined) {
        updates.push('selected_skin = ?');
        values.push(settings.selectedSkin);
      }
      if (settings.adsEnabled !== undefined) {
        updates.push('ads_enabled = ?');
        values.push(settings.adsEnabled ? 1 : 0);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        const query = `UPDATE user_settings SET ${updates.join(', ')}`;
        await this.db.executeSql(query, values);
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  }

  // Méthodes pour les statistiques
  async getGameStats(): Promise<GameStats> {
    if (!this.db) {
      return {
        gamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        perfectHits: 0,
        averageScore: 0,
        bestCombo: 0,
      };
    }

    try {
      const result = await this.db.executeSql('SELECT * FROM game_stats LIMIT 1');
      if (result[0].rows.length === 0) {
        return {
          gamesPlayed: 0,
          totalScore: 0,
          highScore: 0,
          perfectHits: 0,
          averageScore: 0,
          bestCombo: 0,
        };
      }

      const row = result[0].rows.item(0);
      return {
        gamesPlayed: row.games_played,
        totalScore: row.total_score,
        highScore: row.high_score,
        perfectHits: row.perfect_hits,
        averageScore: row.average_score,
        bestCombo: row.best_combo,
      };
    } catch (error) {
      console.error('Error getting game stats:', error);
      return {
        gamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        perfectHits: 0,
        averageScore: 0,
        bestCombo: 0,
      };
    }
  }

  async updateGameStats(stats: Partial<GameStats>): Promise<void> {
    if (!this.db) return;

    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (stats.gamesPlayed !== undefined) {
        updates.push('games_played = ?');
        values.push(stats.gamesPlayed);
      }
      if (stats.totalScore !== undefined) {
        updates.push('total_score = ?');
        values.push(stats.totalScore);
      }
      if (stats.highScore !== undefined) {
        updates.push('high_score = ?');
        values.push(stats.highScore);
      }
      if (stats.perfectHits !== undefined) {
        updates.push('perfect_hits = ?');
        values.push(stats.perfectHits);
      }
      if (stats.averageScore !== undefined) {
        updates.push('average_score = ?');
        values.push(stats.averageScore);
      }
      if (stats.bestCombo !== undefined) {
        updates.push('best_combo = ?');
        values.push(stats.bestCombo);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        const query = `UPDATE game_stats SET ${updates.join(', ')}`;
        await this.db.executeSql(query, values);
      }
    } catch (error) {
      console.error('Error updating game stats:', error);
    }
  }

  // Méthodes pour les skins
  async getSkins(): Promise<Skin[]> {
    if (!this.db) {
      return SKINS.map(skin => ({
        ...skin,
        unlocked: skin.id === 'default'
      }));
    }

    try {
      const result = await this.db.executeSql('SELECT * FROM skins ORDER BY price ASC');
      const skins: Skin[] = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        skins.push({
          id: row.id,
          name: row.name,
          colors: JSON.parse(row.colors),
          price: row.price,
          unlocked: Boolean(row.unlocked),
        });
      }

      return skins;
    } catch (error) {
      console.error('Error getting skins:', error);
      return SKINS.map(skin => ({
        ...skin,
        unlocked: skin.id === 'default'
      }));
    }
  }

  async unlockSkin(skinId: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.executeSql(
        'UPDATE skins SET unlocked = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [skinId]
      );
    } catch (error) {
      console.error('Error unlocking skin:', error);
    }
  }

  // Méthodes pour les sessions de jeu
  async saveGameSession(sessionData: {
    score: number;
    level: number;
    perfectHits: number;
    combo: number;
    duration: number;
    skinUsed: string;
  }): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.executeSql(`
        INSERT INTO game_sessions (score, level, perfect_hits, combo, duration, skin_used)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        sessionData.score,
        sessionData.level,
        sessionData.perfectHits,
        sessionData.combo,
        sessionData.duration,
        sessionData.skinUsed,
      ]);
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  }

  async resetAllData(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.executeSql('DELETE FROM game_sessions');
      await this.db.executeSql('UPDATE game_stats SET games_played = 0, total_score = 0, high_score = 0, perfect_hits = 0, average_score = 0, best_combo = 0');
      await this.db.executeSql('UPDATE skins SET unlocked = 0 WHERE id != "default"');
      await this.db.executeSql('UPDATE skins SET unlocked = 1 WHERE id = "default"');
      await this.db.executeSql('UPDATE user_settings SET selected_skin = "default"');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
      } catch (error) {
        console.error('Error closing database:', error);
      } finally {
        this.db = null;
      }
    }
  }
}

export default new DatabaseService();