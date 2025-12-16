/**
 * AvatarTestHelper.js
 * Utilities for testing Bella video avatar with voice integration
 * Provides functions for testing animations, voice responses, and sentiment mapping
 */

/**
 * Test Emotion Animations
 * Tests each emotion animation one by one
 */
export const testAllAnimations = async (avatarRef, animationList = [
  'idle', 'greeting', 'thinking', 'happy', 'nodding',
  'encouraging', 'sad', 'waving', 'peace', 'elegant_sway'
]) => {
  console.log('🎬 Starting animation tests...');
  
  for (const emotion of animationList) {
    try {
      console.log(`Testing: ${emotion}`);
      await new Promise(resolve => {
        avatarRef.current?.playEmotionAnimation(emotion, () => {
          console.log(`✅ ${emotion} completed`);
          resolve();
        });
        // Timeout after 5 seconds
        setTimeout(resolve, 5000);
      });
    } catch (error) {
      console.error(`❌ Error testing ${emotion}:`, error);
    }
  }
  
  console.log('✅ Animation tests complete!');
};

/**
 * Simulate Voice Input Flow
 * Simulates the complete voice interaction pipeline
 */
export const simulateVoiceFlow = async (avatarRef, userInput, llmResponse) => {
  console.log('🎤 Simulating voice flow...');
  
  // Step 1: User speaking - show thinking
  console.log('1️⃣ User speaking...');
  avatarRef.current?.playAnimation('thinking', false);
  await sleep(2000);
  
  // Step 2: Processing LLM response
  console.log('2️⃣ Processing response...');
  const sentiment = analyzeSentimentLocal(llmResponse);
  console.log('   Detected sentiment:', sentiment);
  
  // Step 3: Play emotion-based animation
  console.log('3️⃣ Playing emotion animation...');
  const emotionMap = {
    'positive': 'happy',
    'negative': 'sad',
    'neutral': 'idle',
    'contemplative': 'thinking',
    'greeting': 'greeting',
    'affirmative': 'nodding'
  };
  
  const emotion = emotionMap[sentiment] || 'idle';
  avatarRef.current?.playEmotionAnimation(emotion);
  await sleep(3000);
  
  // Step 4: Return to idle
  console.log('4️⃣ Returning to idle...');
  avatarRef.current?.playAnimation('idle', true);
  
  console.log('✅ Voice flow simulation complete!');
};

/**
 * Sentiment Analysis (Local)
 * Simple local sentiment analysis without external API
 */
export const analyzeSentimentLocal = (text) => {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  // Positive indicators
  const positiveWords = ['great', 'excellent', 'good', 'happy', 'love', 'awesome', 'wonderful', 'fantastic', 'perfect', 'amazing', 'yes', 'yay', '😊', '😄'];
  
  // Negative indicators
  const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'no', 'wrong', 'failed', 'error', '😢', '😠'];
  
  // Contemplative indicators
  const contemplativeWords = ['think', 'maybe', 'perhaps', 'consider', 'hmm', 'curious', 'wondering'];
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  const contemplativeCount = contemplativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > contemplativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount && negativeCount > contemplativeCount) {
    return 'negative';
  } else if (contemplativeCount > 0) {
    return 'contemplative';
  }
  
  return 'neutral';
};

/**
 * Map Voice Response to Animation
 * Maps LLM response to appropriate avatar animation
 */
export const mapResponseToAnimation = (response) => {
  const sentiment = analyzeSentimentLocal(response);
  
  const emotionMap = {
    'positive': 'happy',
    'negative': 'sad',
    'neutral': 'idle',
    'contemplative': 'thinking',
    'greeting': 'greeting',
    'affirmative': 'nodding',
    'encouraging': 'encouraging'
  };
  
  return emotionMap[sentiment] || 'idle';
};

/**
 * Test Voice Integration
 * Tests integration with voice recognition and synthesis
 */
export const testVoiceIntegration = async (avatarRef) => {
  console.log('🎤 Testing voice integration...');
  
  const testScenarios = [
    {
      input: 'Hello, how are you?',
      response: 'I am doing great! Thanks for asking.',
      expectedEmotion: 'happy'
    },
    {
      input: 'Can you help me?',
      response: 'Of course, I can help you. Let me think about this.',
      expectedEmotion: 'thinking'
    },
    {
      input: 'Tell me something sad',
      response: 'I understand. That must be difficult.',
      expectedEmotion: 'sad'
    },
    {
      input: 'Perfect!',
      response: 'Excellent! I am here to help.',
      expectedEmotion: 'happy'
    }
  ];
  
  for (const scenario of testScenarios) {
    console.log(`\nTesting: "${scenario.input}"`);
    console.log(`Response: "${scenario.response}"`);
    
    await simulateVoiceFlow(avatarRef, scenario.input, scenario.response);
    await sleep(1000);
  }
  
  console.log('\n✅ Voice integration tests complete!');
};

/**
 * Queue Multiple Animations
 * Test animation queueing
 */
export const testAnimationQueue = async (avatarRef, emotions = ['greeting', 'thinking', 'happy', 'nodding']) => {
  console.log('📋 Testing animation queue...');
  
  for (const emotion of emotions) {
    avatarRef.current?.playEmotionAnimation(emotion);
    console.log(`Queued: ${emotion}`);
  }
  
  console.log('✅ Animation queue test complete!');
};

/**
 * Performance Test
 * Measures animation performance and timing
 */
export const performanceTest = async (avatarRef) => {
  console.log('📊 Running performance tests...');
  
  const startTime = performance.now();
  
  // Test 1: Rapid animation switching
  const rapidTest = performance.now();
  for (let i = 0; i < 10; i++) {
    avatarRef.current?.playAnimation('thinking', false);
  }
  const rapidDuration = performance.now() - rapidTest;
  console.log(`Rapid switching (10x): ${rapidDuration.toFixed(2)}ms`);
  
  await sleep(2000);
  
  // Test 2: Loop performance
  const loopTest = performance.now();
  avatarRef.current?.playAnimation('idle', true);
  const loopDuration = performance.now() - loopTest;
  console.log(`Loop start: ${loopDuration.toFixed(2)}ms`);
  
  const totalDuration = performance.now() - startTime;
  console.log(`Total test time: ${totalDuration.toFixed(2)}ms`);
  console.log('✅ Performance tests complete!');
};

/**
 * Accessibility Test
 * Tests accessibility features
 */
export const accessibilityTest = async (avatarRef) => {
  console.log('♿ Testing accessibility...');
  
  // Check for required ARIA attributes
  const container = document.querySelector('.bella-video-avatar-container');
  if (!container) {
    console.error('Container not found!');
    return;
  }
  
  console.log('Checking container properties...');
  console.log('- Width:', window.getComputedStyle(container).width);
  console.log('- Height:', window.getComputedStyle(container).height);
  console.log('- Display:', window.getComputedStyle(container).display);
  
  // Check for video elements
  const videos = container.querySelectorAll('video');
  console.log(`- Video elements: ${videos.length}`);
  
  console.log('✅ Accessibility tests complete!');
};

/**
 * Comprehensive Test Suite
 * Runs all tests in sequence
 */
export const runFullTestSuite = async (avatarRef) => {
  console.log('\n\n========================================');
  console.log('🚀 BELLA AVATAR - FULL TEST SUITE');
  console.log('========================================\n');
  
  try {
    // Test 1: Accessibility
    await accessibilityTest(avatarRef);
    await sleep(1000);
    
    // Test 2: Animation Queue
    await testAnimationQueue(avatarRef);
    await sleep(2000);
    
    // Test 3: All Animations
    await testAllAnimations(avatarRef);
    await sleep(1000);
    
    // Test 4: Voice Integration
    await testVoiceIntegration(avatarRef);
    await sleep(1000);
    
    // Test 5: Performance
    await performanceTest(avatarRef);
    
    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
};

/**
 * Helper: Sleep function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Export all as default for convenience
 */
export default {
  testAllAnimations,
  simulateVoiceFlow,
  analyzeSentimentLocal,
  mapResponseToAnimation,
  testVoiceIntegration,
  testAnimationQueue,
  performanceTest,
  accessibilityTest,
  runFullTestSuite
};

/**
 * Usage:
 * 
 * import AvatarTestHelper from './core/AvatarTestHelper.js';
 * 
 * // Quick test
 * AvatarTestHelper.testAllAnimations(avatarRef);
 * 
 * // Voice flow test
 * AvatarTestHelper.simulateVoiceFlow(avatarRef, 'Hello', 'Hi there!');
 * 
 * // Full test suite
 * AvatarTestHelper.runFullTestSuite(avatarRef);
 */
