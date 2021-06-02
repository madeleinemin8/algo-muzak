const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
createWaveCanvas({ element: 'section', analyser: fft })

function tone (type, pitch, time, duration) {
  const t = time || ctx.currentTime
  const dur = duration || 1
  const osc = new OscillatorNode(ctx, {
      type: type || "sine",
      frequency: pitch || 440
  })
  const lvl = new GainNode(ctx, { gain: 0.001 })

  let real = new Float32Array([ 0, 1])
  let imag = new Float32Array([ 0, 0])
  let wave = ctx.createPeriodicWave(real, imag)
  osc.setPeriodicWave(wave)

  osc.connect(lvl)
  lvl.connect(ctx.destination)
  lvl.connect(fft)
  osc.start(t)
  osc.stop(t + dur)
  adsr({param: lvl.gain, duration: dur, time: t})
}

function adsr (opts) {
  const param = opts.param
  const peak = opts.peak || 1
  const hold = opts.hold || 0.7
  const time = opts.time || ctx.currentTime
  const dur = opts.duration || 1
  const a = opts.attack || dur * 0.2
  const d = opts.decay || dur * 0.1
  const s = opts.sustain || dur * 0.5
  const r = opts.release || dur * 0.2

  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(hold, time+a+d)
  param.linearRampToValueAtTime(hold, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}

function step (rootFreq, steps) {
  let tr2 = Math.pow(2, 1 / 12)
  let rnd = rootFreq * Math.pow(tr2, steps)
  return Math.round(rnd * 100) / 100
}

function r (scale) {
  return scale[Math.floor(Math.random() * scale.length)]
}

const delayStart = 1
const major = [0, 2, 4, 5, 7, 9, 11, 12]
const minor = [0, 2, 3, 5, 7, 8, 10, 12] 
const tempo = 140 * 2 // bpm
const beat = 60/tempo
const beatLengths = [beat, beat/3, beat/2, beat*2]
const bar  = beat * 4
const roots = [440, 329.63, 246.94, 220.00, 196.00]
const rroots = Math.floor(Math.random() * roots.length)
const root = roots[rroots]
console.log(root)
const scale = major
const notes = [
  0, 0, 2, 2, 4, 4, 2, 2, 0, 0
]

var endTime = 0.0
for(let a=0; a < 10; a++) {
  const delayA = a * bar
  notes[1] = r(major)
  notes[2] = r(major)
  notes[8] = r(major)
  for (let i = 0; i < notes.length; i++) {
      const time = i * beat + delayStart + delayA
      const durRandom = Math.floor(Math.random() * beatLengths.length)
      const dur = beatLengths[durRandom]
      endTime = time + dur
      const pitch = step(root, notes[i])
      tone('sine', pitch, time, dur)
  }
}
endTime += 0.5 * beat
for (let a = 0; a<3; a++) {
  tone('sine', step(root, 4), endTime, beat)
  tone('sine', step(root, 2), endTime + beat, beat)
  tone('sine', step(root, 0), endTime + (2 * beat), beat*2)  
  endTime += (4 * beat)
}
tone('sine', step(root, 0), endTime, beat*4)  
