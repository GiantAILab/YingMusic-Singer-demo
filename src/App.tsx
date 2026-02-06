import { useEffect, useState } from 'react';
import type { AudioItem, AudioData } from './types';
import { AudioComparisonRow } from './components/AudioComparisonRow';
import { PaperHeader } from './components/PaperHeader';

// Get experiment name from URL path
function getExperimentName(): string {
  const path = window.location.pathname;
  const parts = path.replace(/^\/+|\/+$/g, '').split('/');
  // If we are on GitHub Pages, the first part might be the repo name
  // If there's only one part and it's not 'default', it might be the repo name or an experiment
  // For this demo, we'll favor 'default' unless explicitly specified
  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'YingMusic-Singer-demo') || parts[0] === '') {
    return 'default';
  }
  return parts.pop() || 'default';
}

const PAPER_INFO = {
  title: "YingMusic-Singer: Zero-shot Singing Voice Synthesis and Editing with Annotation-free Melody Guidance",
  authors: ["YingMusic-Singer Team"],
  abstract: "Singing Voice Synthesis (SVS) remains constrained in practical deployment due to its strong dependence on accurate phoneme-level alignment and manually annotated melody contours—requirements that are resource-intensive and hinder scalability. To overcome these limitations, we propose a melody-driven SVS framework capable of synthesizing arbitrary lyrics following any reference melody, without relying on phoneme-level alignment. Our method builds on a Diffusion Transformer (DiT) architecture, enhanced with a dedicated melody extraction module that derives melody representations directly from reference audio. To ensure robust melody encoding, we employ a teacher model to guide the optimization of the melody extractor, alongside an implicit alignment mechanism that enforces similarity distribution constraints for improved melodic stability and coherence. Additionally, we refine duration modeling using weakly-annotated song data and introduce a Flow-GRPO reinforcement learning strategy with a multiobjective reward function to jointly enhance pronunciation clarity and melodic fidelity. Experiments show that our model achieves superior performance over existing approaches in both objective measures and subjective listening tests, especially in zero-shot and lyric adaptation settings, while maintaining high audio quality without manual annotation. This work offers a practical and scalable solution for advancing data-efficient singing voice synthesis.",
  links: [
    { label: "Paper", url: "https://arxiv.org/pdf/2512.04779", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { label: "Code", url: "https://github.com/GiantAILab/YingMusic-Singer", icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    )},
    { label: "Hugging Face", url: "https://huggingface.co/GiantAILab/YingMusic-Singer", icon: (
      <span className="text-lg">🤗</span>
    )},
    { label: "ModelScope", url: "https://modelscope.cn/models/GiantAI/YingMusic-Singer", icon: (
      <span className="text-lg">🤖</span>
    )}
  ]
};

function App() {
  const [expName] = useState<string>(() => getExperimentName());
  const [data, setData] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data based on experiment name
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setLoading(true);
      setError(null);
      
      const dataUrl = expName === 'default' 
        ? './data/default/data.json' 
        : `./data/${expName}/data.json`;
      
      fetch(dataUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load data from ${dataUrl}`);
          return res.json();
        })
        .then((jsonData: Record<string, Array<Record<string, AudioData>>>) => {
          const transformedData: AudioItem[] = Object.entries(jsonData).map(([uuid, variants]) => {
            const item: AudioItem = { uuid };
            variants.forEach(variantObj => {
              const [key, value] = Object.entries(variantObj)[0];
              // Make absolute paths relative for GitHub Pages compatibility
              if (value && typeof value.wav === 'string' && value.wav.startsWith('/')) {
                value.wav = '.' + value.wav;
              }
              item[key] = value;
            });
            return item;
          });
          setData(transformedData);
        })
        .catch(err => {
          console.error(err);
          setError(`Failed to load data. Make sure the data file exists at ${dataUrl}.`);
        })
        .finally(() => setLoading(false));
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl text-gray-500 font-medium">Loading demo data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div className="max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 font-semibold mb-2">Error Loading Data</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <PaperHeader 
        title={PAPER_INFO.title}
        authors={PAPER_INFO.authors}
        abstract={PAPER_INFO.abstract}
        links={PAPER_INFO.links}
      />

      <main className="max-w-[1400px] mx-auto px-6 py-12 md:py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Audio Samples</h2>
          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            {data.length} Audio Examples
          </div>
        </div>

        <div className="space-y-12">
          {data.map((item, index) => (
            <AudioComparisonRow 
              key={item.uuid} 
              item={item} 
              index={index}
              showTagging={false}
            />
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-[1400px] mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Singing Voice Synthesis Demo Page. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
