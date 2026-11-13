import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Copy,
  X,
  Sparkles,
  Layers,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import JSZip from 'jszip';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseSyncStatus?: 'connecting' | 'synced' | 'error';
  cloudCampaignsCount?: number;
  isSyncingCloud?: boolean;
  onForceCloudSync?: () => Promise<void> | void;
}

const PUBLIC_SHARED_APP_URL = 'https://ais-pre-fdvdpr73jbu2hzpbbibxp5-395073471759.us-west2.run.app';

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  firebaseSyncStatus = 'synced',
  cloudCampaignsCount = 0,
  isSyncingCloud = false,
  onForceCloudSync,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk_package' | 'qrcode'>('android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingApkZip, setIsGeneratingApkZip] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : PUBLIC_SHARED_APP_URL;
  // Never hand out temporary ais-dev sandbox URL to mobile devices (always use public production origin)
  const appUrl = currentOrigin.includes('ais-dev-') ? PUBLIC_SHARED_APP_URL : currentOrigin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTriggerInstall = async () => {
    const success = await install();
    if (success) {
      setStatusNotice('🎉 AutoViral AI instalado com sucesso no seu dispositivo!');
    }
  };

  const handleManualSyncClick = async () => {
    if (!onForceCloudSync) return;
    await onForceCloudSync();
    setStatusNotice(`✅ Sincronização PC ↔ Celular concluída! (${cloudCampaignsCount} campanhas na Nuvem Firebase)`);
    setTimeout(() => setStatusNotice(null), 5000);
  };

  // Generate and download Android APK Project Package (Capacitor/Cordova)
  const handleDownloadApkPackage = async () => {
    try {
      setIsGeneratingApkZip(true);
      const zip = new JSZip();

      // README instructions
      zip.file(
        'LEIA-ME-COMO-GERAR-APK.txt',
        `=====================================================
AUTOVIRAL AI - PACOTE DE COMPILAÇÃO APK ANDROID NATIVO
=====================================================

Você tem 2 formas de ter o AutoViral AI no celular como APK:

FORMA 1 - INSTALAÇÃO INSTANTÂNEA DIRETO PELO NAVEGADOR (RECOMENDADA / WEBAPK):
1. Abra o Chrome no seu celular Android.
2. Acesse a URL da sua plataforma: ${appUrl}
3. Toque no botão "📱 Instalar App / APK no Celular" ou abra o menu dos 3 pontinhos do Chrome e toque em "Instalar aplicativo".
4. O Google Android vai gerar automaticamente um WebAPK nativo com ícone na gaveta de aplicativos, splash screen e sem barra de navegação!

FORMA 2 - COMPILAR O ARQUIVO .APK NATIVO COM ANDROID STUDIO OU CAPACITOR:
1. Instale o Node.js e o Android Studio no computador.
2. Descompacte esta pasta.
3. No terminal, execute:
   npm install -g @capacitor/cli @capacitor/core @capacitor/android
   npx cap init "AutoViral AI" "com.autoviral.app" --web-dir dist
   npx cap add android
   npx cap copy android
   npx cap open android
4. No Android Studio, clique em Build > Build Bundle(s) / APK(s) > Build APK(s).
5. O arquivo "app-debug.apk" será gerado pronto para instalar em qualquer celular Android!
`
      );

      // Capacitor configuration
      zip.file(
        'capacitor.config.json',
        JSON.stringify(
          {
            appId: 'com.autoviral.app',
            appName: 'AutoViral AI',
            webDir: 'dist',
            bundledWebRuntime: false,
            server: {
              url: appUrl,
              cleartext: true,
            },
            android: {
              allowMixedContent: true,
              captureInput: true,
              webContentsDebuggingEnabled: true,
            },
          },
          null,
          2
        )
      );

      // Android Manifest template
      zip.file(
        'AndroidManifest.xml',
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.autoviral.app">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AutoViral AI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="AutoViral AI">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
      );

      // Build script
      zip.file(
        'build-apk.sh',
        `#!/bin/bash
echo "=== Compilando APK do AutoViral AI ==="
npm install
npx cap copy android
cd android && ./gradlew assembleDebug
echo "=== APK gerado com sucesso em android/app/build/outputs/apk/debug/app-debug.apk ==="`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'autoviral-ai-android-apk-package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setStatusNotice('⚠️ Erro ao gerar o pacote APK. Tente novamente.');
    } finally {
      setIsGeneratingApkZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Instalar AutoViral AI no Celular</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Android APK & PWA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Use no celular com tela cheia, sem barra de navegação e com acesso rápido.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Android (WebAPK / Direto)
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ios'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4" />
            iPhone / iPad (iOS)
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'qrcode'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code para Celular
          </button>

          <button
            onClick={() => setActiveTab('apk_package')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'apk_package'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            Pacote APK (.ZIP)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cloud Sync Banner (PC <-> Mobile) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    firebaseSyncStatus === 'error'
                      ? 'bg-rose-400'
                      : firebaseSyncStatus === 'synced'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400 animate-ping'
                  }`}
                />
                <strong className="text-xs text-white">
                  Sincronia em Tempo Real (PC ↔ Celular) • {cloudCampaignsCount} campanhas na Nuvem
                </strong>
              </div>
              {onForceCloudSync && (
                <button
                  type="button"
                  onClick={handleManualSyncClick}
                  disabled={isSyncingCloud}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCloud ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Para o app no celular mostrar exatamente os mesmos dados do computador em tempo real, instale ou abra o app pelo link de produção abaixo (mesma nuvem Firebase). Se você já tinha instalado uma versão antiga antes desta atualização, abra o link abaixo no Chrome/Safari do celular para atualizar automaticamente.
            </p>
            {isInstalled && (
              <p className="text-[11px] text-emerald-300 font-semibold">
                ✅ Você já está usando o aplicativo instalado no dispositivo.
              </p>
            )}
            {statusNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                {statusNotice.startsWith('⚠️') ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>{statusNotice}</span>
              </div>
            )}
          </div>

          {/* TAB 1: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-emerald-300 block text-sm">
                    Instalação Oficial Android (WebAPK Nativo)
                  </strong>
                  <p>
                    O Android cria um <strong>aplicativo nativo real</strong> com ícone na tela inicial, abertura instantânea e notificações, sem precisar passar pela Play Store.
                  </p>
                </div>
              </div>

              {/* Direct Install Button if supported */}
              {isInstallable && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/50 text-center space-y-3">
                  <p className="text-xs font-bold text-white">
                    Seu navegador suporta a instalação direta agora mesmo!
                  </p>
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    Instalar Aplicativo no Android Agora
                  </button>
                </div>
              )}

              {/* Step by Step Guide for Android */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Como instalar pelo Chrome no celular:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center">
                      1
                    </div>
                    <strong className="text-white block">Abra no Chrome</strong>
                    <p className="text-slate-400 text-[11px]">
                      Acesse a URL do AutoViral AI no Google Chrome do celular.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center">
                      2
                    </div>
                    <strong className="text-white block">Toque nos 3 Pontinhos</strong>
                    <p className="text-slate-400 text-[11px]">
                      No canto superior direito do Chrome, abra o menu principal.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center">
                      3
                    </div>
                    <strong className="text-white block">Instalar Aplicativo</strong>
                    <p className="text-slate-400 text-[11px]">
                      Toque em "Instalar aplicativo" ou "Adicionar à tela inicial".
                    </p>
                  </div>
                </div>
              </div>

              {/* URL bar copy */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Link para abrir no celular:</span>
                  <span className="text-slate-300 font-mono text-xs truncate">{appUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IOS SAFARI */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
                <Share2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-blue-300 block text-sm">
                    Instalação no iPhone e iPad (iOS Safari)
                  </strong>
                  <p>
                    No iOS da Apple, o app é instalado diretamente pelo Safari sem precisar da App Store, ficando na tela de início com ícone nativo em alta resolução.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-black flex items-center justify-center">
                    1
                  </div>
                  <strong className="text-white block">Abra no Safari</strong>
                  <p className="text-slate-400 text-[11px]">
                    Abra o link da plataforma no navegador Safari do seu iPhone.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-black flex items-center justify-center">
                    2
                  </div>
                  <strong className="text-white block">Botão Compartilhar</strong>
                  <p className="text-slate-400 text-[11px]">
                    Toque no ícone de Compartilhar (o quadradinho com uma seta para cima na barra inferior).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-black flex items-center justify-center">
                    3
                  </div>
                  <strong className="text-white block">Adicionar à Tela de Início</strong>
                  <p className="text-slate-400 text-[11px]">
                    Role as opções e toque em "Adicionar à Tela de Início", depois em "Adicionar".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-slate-300">
                Aponte a câmera do seu celular para o QR Code abaixo para abrir a plataforma e instalar com 1 toque:
              </p>

              {/* Dynamic QR code renderer using reliable public api or svg */}
              <div className="inline-block p-4 bg-white rounded-3xl shadow-2xl ring-4 ring-emerald-500/30">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`}
                  alt="QR Code AutoViral AI"
                  className="w-48 h-48 block mx-auto rounded-xl"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 font-mono">{appUrl}</span>
              </div>
            </div>
          )}

          {/* TAB 4: APK PACKAGE (.ZIP) */}
          {activeTab === 'apk_package' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                <Layers className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-purple-300 block text-sm">
                    Pacote Completo do Projeto Android Nativo (Capacitor / Gradle)
                  </strong>
                  <p>
                    Para desenvolvedores ou quem deseja compilar um arquivo <code>.apk</code> ou <code>.aab</code> tradicional com Android Studio para distribuir arquivos APK diretamente.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
                <strong className="text-white block">Conteúdo do pacote incluído:</strong>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
                  <li><code>capacitor.config.json</code> configurado para AutoViral AI</li>
                  <li><code>AndroidManifest.xml</code> completo com permissões de Internet e tela cheia</li>
                  <li><code>build-apk.sh</code> script de compilação automática para Android</li>
                  <li><code>LEIA-ME-COMO-GERAR-APK.txt</code> tutorial passo a passo para compilar</li>
                </ul>
              </div>

              <button
                onClick={handleDownloadApkPackage}
                disabled={isGeneratingApkZip}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-950/50 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isGeneratingApkZip ? 'Gerando Pacote ZIP...' : 'Baixar Pacote APK Android (.ZIP)'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compatível com Android 8.0+ e iOS 14+</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
