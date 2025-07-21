import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useFrameCallback,
} from 'react-native-reanimated';
import { useGame } from '@/context/GameContext';
import { GAME_CONFIG, COLORS, SKINS } from '@/constants';
import { Block, ParticleEffect } from '@/types';
import SoundService from '@/services/SoundService';

interface GameEngineProps {
  availableHeight: number;
  onGameOver: (position: { x: number; y: number }) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GameEngine: React.FC<GameEngineProps> = ({ availableHeight, onGameOver }) => {
  const gameContext = useGame();
  const { gameState, dispatch } = gameContext;
  const currentBlock = gameState.currentBlock;
  
  // Récupérer le skin actif
  const activeSkin = gameContext.skins.find(
    skin => skin.id === gameContext.userSettings.selectedSkin
  );
  
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const blockX = useSharedValue(currentBlock.x);
  const blockY = useSharedValue(currentBlock.y);
  
  const gameStateRef = useRef(gameState);
  const screenWidthRef = useRef(SCREEN_WIDTH);

  const direction = useSharedValue<'left' | 'right'>(currentBlock.direction);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
      frameCallback.setActive(false);
    };
  }, []);
  
  useEffect(() => {
    gameStateRef.current = gameState;
    blockX.value = currentBlock.x;
    blockY.value = currentBlock.y;
    direction.value = currentBlock.direction;
  }, [gameState, currentBlock]);

  const updateParticles = (particles: ParticleEffect[]): ParticleEffect[] => {
    return particles
      .map(p => ({
        ...p,
        x: p.x + p.velocityX,
        y: p.y + p.velocityY,
        life: p.life - 1,
      }))
      .filter(p => p.life > 0);
  };

  const safeSetParticles = useCallback((update: React.SetStateAction<ParticleEffect[]>) => {
    if (!isMounted.current) return;

    setParticles(prev => {
      try {
        const currentParticles = Array.isArray(prev) ? prev : [];
        
        if (typeof update === 'function') {
          return update(currentParticles);
        }
        
        return Array.isArray(update) ? update : [];
      } catch (error) {
        return Array.isArray(prev) ? prev : [];
      }
    });
  }, []);

  const frameCallback = useFrameCallback(() => {
    const { isPaused, isGameOver } = gameStateRef.current;
    if (isPaused || isGameOver) {
      return;
    }

    const block = gameStateRef.current.currentBlock;
    const width = currentBlock.width;
    const speed = block.speed;
    const dir = direction.value;
    const newX = blockX.value + (dir === 'right' ? speed : -speed);

    if (newX <= 0) {
      direction.value = 'right';
      gameStateRef.current.currentBlock.direction = 'right';
      blockX.value = 0;
    }
    else if (newX >= screenWidthRef.current - width) {
      direction.value = 'left';
      gameStateRef.current.currentBlock.direction = 'left';
      blockX.value = screenWidthRef.current - width;
    }
    else {
      blockX.value = newX;
    }

    runOnJS(safeSetParticles)(updateParticles);
  }, false);

  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      frameCallback.setActive(true);
    } else {
      frameCallback.setActive(false);
    }
  }, [gameState.isPaused, gameState.isGameOver]);


  const dropBlock = () => {
    if (gameState.isGameOver || gameState.isPaused) {
      return;
    }
    
    const droppedBlock = {
      ...currentBlock,
      x: blockX.value,
      y: blockY.value,
      id: Date.now().toString(),
    };

    const previousBlock = gameState.blocks[gameState.blocks.length - 1];
    let newWidth = currentBlock.width;
    let newX = blockX.value;
    let perfectHit = false;

    if (previousBlock) {
      const overlap = calculateOverlap(droppedBlock, previousBlock);
      
      if (overlap <= 0) {
        dispatch({ type: 'GAME_OVER' });
        onGameOver({ x: blockX.value, y: blockY.value });
        SoundService.playSound('gameOver');
        return;
      }

      newWidth = overlap;
      newX = Math.max(droppedBlock.x, previousBlock.x);
      
      const positionDiff = Math.abs(droppedBlock.x - previousBlock.x);
      
      if (positionDiff <= GAME_CONFIG.PERFECT_THRESHOLD) {
        perfectHit = true;
        dispatch({ type: 'PERFECT_HIT' });
        createParticleEffect(newX + newWidth / 2, blockY.value);
        SoundService.playSound('perfect');
      } else {
        SoundService.playSound('drop');
      }
    } else {
      SoundService.playSound('drop');
    }

    const finalBlock = {
      ...droppedBlock,
      x: newX,
      width: newWidth,
    };

    dispatch({ type: 'ADD_BLOCK', payload: finalBlock });
    
    const baseScore = 10;
    const comboBonus = gameState.combo * 5;
    const perfectBonus = perfectHit ? 50 : 0;
    const newScore = gameState.score + baseScore + comboBonus + perfectBonus;
    
    dispatch({ type: 'UPDATE_SCORE', payload: newScore });

    if (perfectHit) {
      const newCombo = gameState.combo + 1;
      dispatch({ type: 'UPDATE_COMBO', payload: newCombo });
    } else {
      dispatch({ type: 'UPDATE_COMBO', payload: 0 });
    }

    const nextBlockWidth = Math.max(
      newWidth * GAME_CONFIG.WIDTH_DECREASE,
      20
    );
    const nextBlockSpeed = Math.min(
      currentBlock.speed + GAME_CONFIG.SPEED_INCREASE,
      8
    );

    const newBlock = {
      id: (parseInt(currentBlock.id) + 1).toString(),
      x: SCREEN_WIDTH / 2 - nextBlockWidth / 2,
      y: blockY.value - GAME_CONFIG.INITIAL_BLOCK_HEIGHT,
      width: nextBlockWidth,
      height: GAME_CONFIG.INITIAL_BLOCK_HEIGHT,
      color: getRandomColor(),
      speed: nextBlockSpeed,
      direction: 'right' as const,
    };

    dispatch({ type: 'SET_CURRENT_BLOCK', payload: newBlock });
    blockX.value = newBlock.x;
    blockY.value = newBlock.y;
    direction.value = 'right';

    const newLevel = Math.floor((gameState.blocks.length + 1) / 10) + 1;
    if (newLevel > gameState.level) {
      dispatch({ type: 'UPDATE_LEVEL', payload: newLevel });
    }
  };

  const calculateOverlap = (block1: Block, block2: Block): number => {
    const leftEdge = Math.max(block1.x, block2.x);
    const rightEdge = Math.min(block1.x + block1.width, block2.x + block2.width);
    return Math.max(0, rightEdge - leftEdge);
  };

  const createParticleEffect = (x: number, y: number) => {
    const newParticles: ParticleEffect[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: `${Date.now()}-${i}`,
        x,
        y,
        velocityX: (Math.random() - 0.5) * 15,
        velocityY: -Math.random() * 10,
        life: 60,
        color: getRandomColor(),
        size: Math.random() * 10 + 8,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const getRandomColor = () => {
    // Utiliser les couleurs du skin actif, ou les couleurs par défaut si aucun skin n'est trouvé
    if (activeSkin) {
      const colors = activeSkin.colors;
      return colors[Math.floor(Math.random() * colors.length)];
    }
    // Sinon, utiliser les couleurs de secours
    const colors = [COLORS.PRIMARY, COLORS.SECONDARY, COLORS.ACCENT, COLORS.SUCCESS];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: dropBlock,
  });

  const animatedBlockStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: blockX.value },
      { translateY: blockY.value },
    ],
    width: currentBlock.width,
    height: currentBlock.height,
    backgroundColor: currentBlock.color,
  }));

  // Correction : Conditionner le centrage uniquement au démarrage
  useEffect(() => {
    if (gameState.blocks.length === 0) {
      const centeredBlock = {
        ...currentBlock,
        x: SCREEN_WIDTH / 2 - currentBlock.width / 2,
        y: availableHeight - 100
      };
      
      dispatch({ type: 'SET_CURRENT_BLOCK', payload: centeredBlock });
      blockX.value = centeredBlock.x;
      blockY.value = centeredBlock.y;
      direction.value = centeredBlock.direction;
    }
  }, [availableHeight, gameState.blocks.length]);

  return (
    <View style={[styles.container, { height: availableHeight }]} {...panResponder.panHandlers}>
      {gameState.blocks.map((block: Block) => (
        <Animated.View
          key={block.id}
          style={[
            styles.block,
            {
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              backgroundColor: block.color,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.block,
          animatedBlockStyle,
        ]}
      />

      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life / 60,
              borderRadius: particle.size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  block: {
    position: 'absolute',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  particle: {
    position: 'absolute',
    shadowColor: '#FFF',
    shadowRadius: 3,
    shadowOpacity: 0.8,
  },
});

export default GameEngine;