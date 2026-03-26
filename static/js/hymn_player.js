/* Tone.js Music Player for Christian Hymns */
'use strict';

class HymnPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentSong = null;
        this.synth = null;
        this.part = null;
        this.songs = this._initSongs();
    }

    async init() {
        await Tone.start();
        
        // Use smoother synth with better envelope
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { 
                type: 'triangle',  // Smoother than sine
                partials: [1, 0.5, 0.25]  // Add harmonics
            },
            envelope: { 
                attack: 0.05,   // Slower attack
                decay: 0.2, 
                sustain: 0.4,   // Higher sustain
                release: 0.8    // Longer release
            },
            volume: -12  // Reduce volume to prevent clipping
        }).toDestination();
        
        // Add reverb for smoothness
        const reverb = new Tone.Reverb({
            decay: 2,
            wet: 0.3
        }).toDestination();
        
        this.synth.connect(reverb);
        
        console.log('HymnPlayer initialized with smooth sound');
    }

    _initSongs() {
        return {
            'amazing_grace': {
                name: 'Amazing Grace',
                tempo: 70,
                notes: [
                    ['G4', '0:0:0'], ['C5', '0:0:2'], ['E5', '0:1:0'], ['C5', '0:1:2'],
                    ['E5', '0:2:0'], ['D5', '0:2:2'], ['C5', '0:3:0'], ['A4', '0:3:2'],
                    ['G4', '1:0:0'], ['C5', '1:0:2'], ['E5', '1:1:0'], ['C5', '1:1:2'],
                    ['G5', '1:2:0'], ['E5', '1:2:2'], ['C5', '1:3:0'], ['C5', '1:3:2']
                ]
            },
            'as_the_deer': {
                name: 'As The Deer',
                tempo: 65,
                notes: [
                    ['E4', '0:0:0'], ['G4', '0:0:2'], ['A4', '0:1:0'], ['B4', '0:1:2'],
                    ['A4', '0:2:0'], ['G4', '0:2:2'], ['E4', '0:3:0'], ['D4', '0:3:2'],
                    ['E4', '1:0:0'], ['G4', '1:0:2'], ['B4', '1:1:0'], ['D5', '1:1:2'],
                    ['B4', '1:2:0'], ['A4', '1:2:2'], ['G4', '1:3:0'], ['E4', '1:3:2']
                ]
            },
            'how_great_thou_art': {
                name: 'How Great Thou Art',
                tempo: 60,
                notes: [
                    ['C4', '0:0:0'], ['E4', '0:0:2'], ['G4', '0:1:0'], ['C5', '0:1:2'],
                    ['B4', '0:2:0'], ['A4', '0:2:2'], ['G4', '0:3:0'], ['F4', '0:3:2'],
                    ['E4', '1:0:0'], ['G4', '1:0:2'], ['C5', '1:1:0'], ['E5', '1:1:2'],
                    ['D5', '1:2:0'], ['C5', '1:2:2'], ['G4', '1:3:0'], ['C4', '1:3:2']
                ]
            },
            'blessed_assurance': {
                name: 'Blessed Assurance',
                tempo: 75,
                notes: [
                    ['D4', '0:0:0'], ['F#4', '0:0:2'], ['A4', '0:1:0'], ['D5', '0:1:2'],
                    ['C#5', '0:2:0'], ['B4', '0:2:2'], ['A4', '0:3:0'], ['G4', '0:3:2'],
                    ['F#4', '1:0:0'], ['A4', '1:0:2'], ['D5', '1:1:0'], ['F#5', '1:1:2'],
                    ['E5', '1:2:0'], ['D5', '1:2:2'], ['A4', '1:3:0'], ['D4', '1:3:2']
                ]
            },
            'great_is_thy_faithfulness': {
                name: 'Great Is Thy Faithfulness',
                tempo: 65,
                notes: [
                    ['G4', '0:0:0'], ['B4', '0:0:2'], ['D5', '0:1:0'], ['G5', '0:1:2'],
                    ['F#5', '0:2:0'], ['E5', '0:2:2'], ['D5', '0:3:0'], ['C5', '0:3:2'],
                    ['B4', '1:0:0'], ['D5', '1:0:2'], ['G5', '1:1:0'], ['B5', '1:1:2'],
                    ['A5', '1:2:0'], ['G5', '1:2:2'], ['D5', '1:3:0'], ['G4', '1:3:2']
                ]
            },
            'holy_holy_holy': {
                name: 'Holy, Holy, Holy',
                tempo: 70,
                notes: [
                    ['E4', '0:0:0'], ['G#4', '0:0:2'], ['B4', '0:1:0'], ['E5', '0:1:2'],
                    ['D#5', '0:2:0'], ['C#5', '0:2:2'], ['B4', '0:3:0'], ['A4', '0:3:2'],
                    ['G#4', '1:0:0'], ['B4', '1:0:2'], ['E5', '1:1:0'], ['G#5', '1:1:2'],
                    ['F#5', '1:2:0'], ['E5', '1:2:2'], ['B4', '1:3:0'], ['E4', '1:3:2']
                ]
            },
            'it_is_well': {
                name: 'It Is Well With My Soul',
                tempo: 60,
                notes: [
                    ['C4', '0:0:0'], ['E4', '0:0:2'], ['G4', '0:1:0'], ['C5', '0:1:2'],
                    ['B4', '0:2:0'], ['A4', '0:2:2'], ['G4', '0:3:0'], ['F4', '0:3:2'],
                    ['E4', '1:0:0'], ['G4', '1:0:2'], ['C5', '1:1:0'], ['E5', '1:1:2'],
                    ['D5', '1:2:0'], ['C5', '1:2:2'], ['G4', '1:3:0'], ['C4', '1:3:2']
                ]
            },
            'what_a_friend': {
                name: 'What A Friend We Have In Jesus',
                tempo: 65,
                notes: [
                    ['F4', '0:0:0'], ['A4', '0:0:2'], ['C5', '0:1:0'], ['F5', '0:1:2'],
                    ['E5', '0:2:0'], ['D5', '0:2:2'], ['C5', '0:3:0'], ['Bb4', '0:3:2'],
                    ['A4', '1:0:0'], ['C5', '1:0:2'], ['F5', '1:1:0'], ['A5', '1:1:2'],
                    ['G5', '1:2:0'], ['F5', '1:2:2'], ['C5', '1:3:0'], ['F4', '1:3:2']
                ]
            }
        };
    }

    async play(songKey) {
        if (!this.synth) await this.init();
        
        const song = this.songs[songKey];
        if (!song) return false;

        this.stop();
        this.currentSong = songKey;
        Tone.Transport.bpm.value = song.tempo;

        // Convert notes to proper format with longer durations
        const events = song.notes.map(n => {
            return {
                time: n[1],
                note: n[0],
                duration: '4n'  // Quarter note duration for smoothness
            };
        });

        this.part = new Tone.Part((time, event) => {
            this.synth.triggerAttackRelease(event.note, event.duration, time, 0.5);  // Velocity 0.5
        }, events);

        this.part.loop = true;
        this.part.loopEnd = '2:0:0';
        this.part.start(0);
        Tone.Transport.start();
        this.isPlaying = true;
        return true;
    }

    stop() {
        if (this.part) {
            this.part.stop();
            this.part.dispose();
            this.part = null;
        }
        Tone.Transport.stop();
        this.isPlaying = false;
        this.currentSong = null;
    }

    pause() {
        Tone.Transport.pause();
        this.isPlaying = false;
    }

    resume() {
        Tone.Transport.start();
        this.isPlaying = true;
    }

    getSongList() {
        return Object.keys(this.songs).map(key => ({
            key,
            name: this.songs[key].name
        }));
    }
}

window.hymnPlayer = new HymnPlayer();
