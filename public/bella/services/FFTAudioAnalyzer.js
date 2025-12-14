// FFT Audio Analyzer for Lip-Sync
// Uses Web Audio API to analyze frequency data for lip-sync morphing

class FFTAudioAnalyzer {
  constructor(audioContext) {
    this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.sourceNode = null;
    this.isAnalyzing = false;
  }

  connectAudioSource(sourceNode) {
    this.sourceNode = sourceNode;
    sourceNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  start() {
    this.isAnalyzing = true;
  }

  stop() {
    this.isAnalyzing = false;
  }

  analyze() {
    if (!this.isAnalyzing) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.processFrequencyData();
  }

  processFrequencyData() {
    const data = this.dataArray;
    const length = data.length;
    
    // Divide frequency spectrum into bands
    const lowFreq = this.getAverageFrequency(0, length * 0.25);
    const midFreq = this.getAverageFrequency(length * 0.25, length * 0.75);
    const highFreq = this.getAverageFrequency(length * 0.75, length);
    
    // Normalize to 0-1 range
    const normalizedLow = lowFreq / 255;
    const normalizedMid = midFreq / 255;
    const normalizedHigh = highFreq / 255;
    
    // Calculate lip morph targets
    const mouthOpen = (normalizedMid + normalizedHigh) / 2;
    const consonantStrength = normalizedHigh * 0.8;
    const vowelOpenness = normalizedMid * 0.6;
    
    return {
      mouthOpen: Math.min(mouthOpen, 1.0),
      consonantStrength: consonantStrength,
      vowelOpenness: vowelOpenness,
      energy: (lowFreq + midFreq + highFreq) / 3 / 255,
      frequencies: {
        low: normalizedLow,
        mid: normalizedMid,
        high: normalizedHigh
      }
    };
  }

  getAverageFrequency(start, end) {
    const data = this.dataArray;
    let sum = 0;
    for (let i = Math.floor(start); i < Math.floor(end); i++) {
      sum += data[i];
    }
    return sum / (end - start);
  }

  getMorphTargets() {
    const analysis = this.analyze();
    if (!analysis) return {};
    
    return {
      jaw: analysis.mouthOpen,
      lipCornerRaise: analysis.vowelOpenness * 0.5,
      mouthSmile: 0,
      tonguePosition: analysis.consonantStrength
    };
  }

  dispose() {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    this.analyser.disconnect();
  }
}

export default FFTAudioAnalyzer;
