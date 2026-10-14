import React, { useRef, useState } from 'react';
import {
  X,
  FileCheck2,
  ShieldCheck,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  Loader2
} from 'lucide-react';
import { SignatureCanvas, type SignatureCanvasRef } from './SignatureCanvas';
import { generateAndUploadWaiver } from '../../services/waiverService';
import { useClientStore } from '../../stores/useClientStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Client } from '../../types';

interface DigitalWaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillClient?: Client;
  onWaiverSaved?: (pdfUrl: string) => void;
}

export const DigitalWaiverModal: React.FC<DigitalWaiverModalProps> = ({
  isOpen,
  onClose,
  prefillClient,
  onWaiverSaved
}) => {
  const { clients, updateClient } = useClientStore();
  const { currentUser } = useAuthStore();
  const sigRef = useRef<SignatureCanvasRef | null>(null);

  const [selectedClientId, setSelectedClientId] = useState(prefillClient?.id || clients[0]?.id || '');
  const [hasSignature, setHasSignature] = useState(false);
  const [isLegalAge, setIsLegalAge] = useState(true);
  const [hasMedicalCleared, setHasMedicalCleared] = useState(true);
  const [agreedToAftercare, setAgreedToAftercare] = useState(true);
  const [agreedToDataProcessing, setAgreedToDataProcessing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const activeClient = clients.find((c) => c.id === selectedClientId) || prefillClient;

  const handleSaveWaiver = async () => {
    setErrorMessage('');

    if (!activeClient) {
      setErrorMessage('Моля изберете клиент.');
      return;
    }

    if (!isLegalAge || !hasMedicalCleared || !agreedToAftercare || !agreedToDataProcessing) {
      setErrorMessage('Всички правни и медицински точки от декларацията са задължителни.');
      return;
    }

    if (!sigRef.current || sigRef.current.isEmpty()) {
      setErrorMessage('Моля клиентът да положи своя подпис в полето преди запазване.');
      return;
    }

    const signatureDataUrl = sigRef.current.toDataURL();

    setIsGenerating(true);

    try {
      const result = await generateAndUploadWaiver({
        client: activeClient,
        artistName: currentUser?.name || 'Димитър',
        artistId: currentUser?.id || 'dimitar',
        signatureDataUrl
      });

      setIsGenerating(false);

      if (result.success) {
        setGeneratedPdfUrl(result.pdfUrl);

        // Актуализираме клиентския профил в локалния Zustand store
        updateClient(activeClient.id, {
          hasConsent: true,
          waiverPdfUrl: result.pdfUrl,
          waiverSignedAt: new Date().toISOString()
        });

        if (onWaiverSaved) {
          onWaiverSaved(result.pdfUrl);
        }
      } else {
        setErrorMessage(result.error || 'Възникна грешка при генерирането на PDF документа.');
      }
    } catch (err: unknown) {
      setIsGenerating(false);
      const e = err as { message?: string };
      setErrorMessage(e.message || 'Грешка при качване на документа във Firebase Storage.');
    }
  };

  const handleReset = () => {
    setGeneratedPdfUrl(null);
    setHasSignature(false);
    if (sigRef.current) sigRef.current.clear();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#233030] border border-[#3e4f4e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хедър */}
        <div className="px-5 py-3.5 border-b border-[#303d3c] flex items-center justify-between bg-[#1b2525]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#762685]/30 text-[#d48be6] border border-[#762685]/50 flex items-center justify-center">
              <FileCheck2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Digital Waiver (Декларация)</h3>
              <p className="text-[11px] text-slate-400">Правен документ с подпис & качване във Firebase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#303d3c] text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Съдържание */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {generatedPdfUrl ? (
            /* Екран при успешно генериран и качен PDF */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-950/80 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">
                  Декларацията е подписана и архивирана!
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Неизменният PDF е качен във Firebase Storage и линкът е запазен в профила на{' '}
                  <strong className="text-white">{activeClient?.name}</strong> във Firestore.
                </p>
              </div>

              <div className="p-3 bg-[#1e2a29] border border-[#3e4f4e] rounded-2xl max-w-sm mx-auto text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Статус на документа:</span>
                  <span className="font-bold text-emerald-400">Валиден & Заверен</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Клиент:</span>
                  <span className="font-bold text-white">{activeClient?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Татуист:</span>
                  <span className="font-bold text-[#d48be6]">{currentUser?.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={generatedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                  <ExternalLink size={15} />
                  <span>Отвори PDF</span>
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-[#303d3c] hover:bg-[#3d4d4c] text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Нов подпис
                </button>
              </div>
            </div>
          ) : (
            /* Форма за подписване */
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200 animate-in zoom-in-95">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Избор на клиент */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Клиент за декларацията *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#762685]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.hasConsent ? '• [Вече подписан]' : ''}
                    </option>
                  ))}
                </select>
                {activeClient?.allergies && (
                  <p className="text-[11px] text-amber-300 mt-1 font-medium">
                    ⚠️ Здравна бележка: {activeClient.allergies}
                  </p>
                )}
              </div>

              {/* Правен текст на декларацията */}
              <div className="bg-[#1e2a29] p-3.5 rounded-2xl border border-[#3c4c4b] space-y-2">
                <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#d48be6]" />
                  Правен текст за информирано съгласие
                </p>
                <div className="text-[11px] text-slate-300 space-y-2 max-h-36 overflow-y-auto pr-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLegalAge}
                      onChange={(e) => setIsLegalAge(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#762685] rounded shrink-0"
                    />
                    <span>1. Удостоверявам, че имам навършени 18 години и предоставям документ за самоличност.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMedicalCleared}
                      onChange={(e) => setHasMedicalCleared(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#762685] rounded shrink-0"
                    />
                    <span>2. Не съм под въздействие на алкохол, наркотици или упойващи вещества. Нямам хемофилия или инфекции.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToAftercare}
                      onChange={(e) => setAgreedToAftercare(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#762685] rounded shrink-0"
                    />
                    <span>3. Осведомен(а) съм за необратимия характер на татуирането и поемам ангажимент да спазвам указанията за заздравяване.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToDataProcessing}
                      onChange={(e) => setAgreedToDataProcessing(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#762685] rounded shrink-0"
                    />
                    <span>4. Съгласен(на) съм студиото да архивира цифрово подписания документ съгласно GDPR.</span>
                  </label>
                </div>
              </div>

              {/* HTML5 Canvas подпис */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Подпис на клиента с пръст / стилус *
                </label>
                <SignatureCanvas
                  ref={sigRef}
                  onSignatureChange={setHasSignature}
                  height={150}
                />
              </div>

              {/* Бутони */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-[#303d3c] hover:bg-[#3d4d4c] text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="button"
                  disabled={!hasSignature || isGenerating}
                  onClick={handleSaveWaiver}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                    !hasSignature || isGenerating
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-[#762685] hover:bg-[#8d2fa0] text-white active:scale-98 shadow-[0_0_15px_rgba(118,38,133,0.4)]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Генериране на PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Генерирай & Качи PDF</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
