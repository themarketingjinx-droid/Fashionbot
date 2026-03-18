import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, Package, Tag, DollarSign, FileText } from 'lucide-react';

const STEP_LABELS = ['Upload Model', 'Piece Details', 'Pricing & Edition', 'Review & Mint'];

export default function Designer() {
  const [step, setStep] = useState(0);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    file: null,
    name: '',
    designer: '',
    description: '',
    tags: '',
    price: '',
    currency: 'ETH',
    edition: '1',
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) update('file', file);
  };

  const handleMint = async () => {
    setMinting(true);
    await new Promise((r) => setTimeout(r, 3000));
    setMinting(false);
    setMinted(true);
  };

  if (minted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-2xl p-10"
        >
          <div className="w-20 h-20 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-lime-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Piece Minted!</h2>
          <p className="text-white/40 text-sm mb-6">
            <span className="text-white font-semibold">"{form.name}"</span> is now live on DRIP NFT.
            Collectors can preview your piece in 3D and purchase to unlock full access.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            <div className="bg-black/40 rounded-xl p-3">
              <p className="text-xs text-white/30 mb-1">Token ID</p>
              <p className="font-mono text-sm text-white">#00{Math.floor(Math.random()*900)+100}</p>
            </div>
            <div className="bg-black/40 rounded-xl p-3">
              <p className="text-xs text-white/30 mb-1">Contract</p>
              <p className="font-mono text-xs text-white/60 truncate">0x4e8f...c29a</p>
            </div>
          </div>
          <button
            onClick={() => { setMinted(false); setStep(0); setForm({ file: null, name: '', designer: '', description: '', tags: '', price: '', currency: 'ETH', edition: '1' }); }}
            className="w-full py-3 rounded-xl font-bold text-black text-sm bg-gold"
          >
            Upload Another Piece
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs tracking-widest text-gold uppercase mb-2">Designer Portal</p>
        <h1 className="text-3xl font-black text-white">Upload Your Piece</h1>
        <p className="text-white/40 text-sm mt-1">Mint your 3D fashion design as a protected NFT</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step ? 'bg-gold border-gold text-black' :
                  i === step ? 'border-gold text-gold' :
                  'border-white/20 text-white/30'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${i === step ? 'text-gold' : 'text-white/30'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-1 mb-4 ${i < step ? 'bg-gold' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Upload */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <input ref={fileRef} type="file" accept=".glb,.gltf,.fbx,.obj" className="hidden" onChange={handleFile} />
            <div
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                form.file ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-gold/50'
              }`}
            >
              {form.file ? (
                <>
                  <Package size={40} className="text-gold mx-auto mb-3" />
                  <p className="font-bold text-white">{form.file.name}</p>
                  <p className="text-xs text-white/40 mt-1">{(form.file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                </>
              ) : (
                <>
                  <Upload size={40} className="text-white/20 mx-auto mb-3" />
                  <p className="font-semibold text-white/60">Drop your 3D file here</p>
                  <p className="text-xs text-white/30 mt-2">GLB, GLTF, FBX, OBJ · Max 250MB</p>
                </>
              )}
            </div>
            <button
              disabled={!form.file}
              onClick={() => setStep(1)}
              className="mt-6 w-full py-3 rounded-xl font-bold text-black text-sm bg-gold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </motion.div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {[
              { label: 'Piece Name', key: 'name', placeholder: 'e.g. Obsidian Couture Gown', icon: FileText },
              { label: 'Designer / Studio', key: 'designer', placeholder: 'e.g. Astra Veil Studio', icon: Tag },
            ].map(({ label, key, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider mb-2">
                  <Icon size={11} /> {label}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold placeholder:text-white/20"
                />
              </div>
            ))}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider mb-2">
                <FileText size={11} /> Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Describe the piece, materials, inspiration…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold placeholder:text-white/20 resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider mb-2">
                <Tag size={11} /> Tags (comma-separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="e.g. Evening, Avant-garde, Silk"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold placeholder:text-white/20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl font-semibold text-white/50 border border-white/10 text-sm">← Back</button>
              <button
                disabled={!form.name || !form.designer}
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl font-bold text-black text-sm bg-gold disabled:opacity-30"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Pricing */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider mb-2">
                <DollarSign size={11} /> Price
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold placeholder:text-white/20"
                />
                <select
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"
                >
                  <option value="ETH">ETH</option>
                  <option value="MATIC">MATIC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider mb-2">
                <Package size={11} /> Edition Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1', '3', '5', '10'].map((n) => (
                  <button
                    key={n}
                    onClick={() => update('edition', n)}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                      form.edition === n ? 'bg-gold border-gold text-black' : 'border-white/20 text-white/50 hover:border-gold/50'
                    }`}
                  >
                    {n === '1' ? '1/1' : `1 of ${n}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
              <p className="text-xs text-white/40 mb-2">Royalty Structure</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Creator royalty</span>
                <span className="text-white font-semibold">10%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/60">Platform fee</span>
                <span className="text-white font-semibold">2.5%</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold text-white/50 border border-white/10 text-sm">← Back</button>
              <button
                disabled={!form.price}
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl font-bold text-black text-sm bg-gold disabled:opacity-30"
              >
                Review →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 mb-6">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Confirm Details</p>
              {[
                ['File', form.file?.name],
                ['Name', form.name],
                ['Designer', form.designer],
                ['Description', form.description?.slice(0, 80) + (form.description?.length > 80 ? '…' : '')],
                ['Tags', form.tags],
                ['Price', `${form.price} ${form.currency}`],
                ['Edition', `1 of ${form.edition}`],
              ].map(([k, v]) => v && (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-white/30 text-sm flex-shrink-0">{k}</span>
                  <span className="text-white text-sm text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-6">
              <p className="text-xs text-gold font-semibold mb-1">Protection Enabled</p>
              <p className="text-xs text-white/40">
                Buyers can preview your piece in 3D but cannot screenshot, save, or access the file until purchase.
                Watermarking and copy-protection are applied automatically.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-semibold text-white/50 border border-white/10 text-sm">← Back</button>
              <button
                onClick={handleMint}
                disabled={minting}
                className="flex-1 py-3 rounded-xl font-bold text-black text-sm bg-gold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {minting ? <><Loader2 size={16} className="animate-spin" /> Minting…</> : '✦ Mint NFT'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
