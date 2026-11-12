import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Cpu, Download, Info, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InstructionsDialog } from '@/components/mcedit/SiteShell';
import { detectDeviceArchitecture, type ArchitectureDetection } from '@/lib/deviceArchitecture';

type ApkArchitecture = 'arm-v8a' | 'armeabi';
type MusicOption = 'with' | 'without';

const apkDownloads: Record<ApkArchitecture, Record<MusicOption, string>> = {
  'arm-v8a': {
    with: 'https://mega.nz/file/zYchjDYB#uZxM1EJaQ8rQDln3vVlbeAuLc5LOEt3FjsY3KKTyRD4',
    without: 'https://mega.nz/file/DV8QXThZ#YpHlfO7bmu0f14uaGl1U6NWPeMWJuUxlSWI57QKwdwA',
  },
  armeabi: {
    with: 'https://mega.nz/file/zFcUAaSS#opIEBiH-g5unwMRlnS8rZXwl6v4a_FNAfIqHyUNWmhE',
    without: 'https://mega.nz/file/GUliyITS#ffOihBwOBuKJy_VhAVtcCxClK8zIsGYu_FQrjk_tRo8',
  },
};

const architectureOptions: { value: ApkArchitecture; label: string; detail: string }[] = [
  { value: 'arm-v8a', label: 'ARM-v8a', detail: 'ARM64 / ARMv8-A' },
  { value: 'armeabi', label: 'armeabi', detail: 'ARM32 / ARMv7-A' },
];

function openDownload(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

const ApkDownloadsPage = () => {
  const [detection, setDetection] = useState<ArchitectureDetection | null>(null);
  const [selectedArchitecture, setSelectedArchitecture] = useState<ApkArchitecture | null>(null);

  useEffect(() => {
    let active = true;
    detectDeviceArchitecture().then((result) => {
      if (!active) return;
      setDetection(result);
      if (result.architecture === 'arm64') setSelectedArchitecture('arm-v8a');
      if (result.architecture === 'arm32') setSelectedArchitecture('armeabi');
    });
    return () => { active = false; };
  }, []);

  const recommendedArchitecture = detection?.architecture === 'arm64'
    ? 'arm-v8a'
    : detection?.architecture === 'arm32'
      ? 'armeabi'
      : null;

  return (
    <div className="content-page page-width">
      <div className="page-intro">
        <Link className="back-link" to="/" aria-label="Back to MCEDIT home">
          <ArrowLeft aria-hidden="true" /> Home
        </Link>
        <div className="page-title-row">
          <div>
            <p className="eyebrow">Android edition</p>
            <h1>Minecraft APKs</h1>
            <p className="page-lede">Choose the build that matches your phone, then pick your music preference.</p>
          </div>
          <InstructionsDialog
            title="How to Install Minecraft from MCEDIT"
            description="Follow these steps to install the APK on your Android device."
          >
            <ol className="instruction-list">
              <li>Visit mcedit-site.lovable.app.</li>
              <li>Open Minecraft APKs.</li>
              <li>Choose your device architecture (ARM-v8a or armeabi).</li>
              <li>Choose With Music or Without Music.</li>
              <li>Download the APK.</li>
              <li>Open your Downloads folder.</li>
              <li>Tap the downloaded APK.</li>
              <li>Allow installation from unknown sources if prompted.</li>
              <li>Tap Install and wait.</li>
            </ol>
          </InstructionsDialog>
        </div>
      </div>

      <section className="compatibility-section" aria-labelledby="compatibility-heading">
        <div className="compatibility-icon"><Cpu aria-hidden="true" /></div>
        <div className="compatibility-content">
          <div className="compatibility-topline">
            <div>
              <div className="experimental-label"><span className="experimental-mark">!</span> Experimental</div>
              <h2 id="compatibility-heading">Device architecture check</h2>
            </div>
            <Badge variant="outline" className="client-only-badge">Runs in this browser only</Badge>
          </div>
          <div className="detected-value-row">
            <span className="detected-label">Detected architecture</span>
            <span className="detected-value">{detection?.label ?? 'Checking browser information…'}</span>
          </div>
          {recommendedArchitecture ? (
            <div className="recommendation-row">
              <span className="recommendation-indicator"><Check aria-hidden="true" /> Recommended for your device</span>
              <span className="recommendation-version">{recommendedArchitecture}</span>
            </div>
          ) : detection?.architecture === 'unknown' ? (
            <p className="manual-prompt"><Info aria-hidden="true" /> This browser cannot identify your phone’s architecture. Please choose manually below.</p>
          ) : null}
          <p className="compatibility-disclaimer">Browser information can be incomplete and does not guarantee compatibility. Your device details are not collected or stored. You can always choose a version manually.</p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="architecture-heading">
        <div className="section-heading-row architecture-heading-row">
          <div>
            <p className="eyebrow">Choose a build</p>
            <h2 id="architecture-heading">Device architecture</h2>
          </div>
          {recommendedArchitecture && (
            <Button
              variant="outline"
              className="recommendation-action"
              onClick={() => setSelectedArchitecture(recommendedArchitecture)}
            >
              Use recommended version <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
        <div className="architecture-options" role="group" aria-label="Choose device architecture">
          {architectureOptions.map((option) => {
            const isRecommended = recommendedArchitecture === option.value;
            const isSelected = selectedArchitecture === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                aria-pressed={isSelected}
                className={`architecture-option${isSelected ? ' architecture-option-selected' : ''}`}
                onClick={() => setSelectedArchitecture(option.value)}
              >
                <span className="architecture-option-copy">
                  <span className="architecture-option-name">{option.label}</span>
                  <span className="architecture-option-detail">{option.detail}</span>
                </span>
                {isRecommended && <span className="option-recommended">Recommended</span>}
              </Button>
            );
          })}
        </div>
      </section>

      {selectedArchitecture ? (
        <section className="apk-options-section" aria-labelledby="apk-options-heading">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">{selectedArchitecture}</p>
              <h2 id="apk-options-heading">Choose your version</h2>
            </div>
            <span className="apk-options-caption"><Smartphone aria-hidden="true" /> Android APK</span>
          </div>
          <div className="apk-option-grid">
            {(['with', 'without'] as const).map((musicOption) => {
              const label = musicOption === 'with' ? 'With Music' : 'Without Music';
              return (
                <div className="apk-option" key={musicOption}>
                  <div className="apk-option-copy">
                    <span className="choice-kicker">{musicOption === 'with' ? 'SOUNDTRACK INCLUDED' : 'NO SOUNDTRACK'}</span>
                    <h3>{label}</h3>
                  </div>
                  <Button className="apk-download-button" onClick={() => openDownload(apkDownloads[selectedArchitecture][musicOption])}>
                    <Download aria-hidden="true" /> Download
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="selection-empty-state">
          <Smartphone aria-hidden="true" />
          <p>Select ARM-v8a or armeabi to see the available downloads.</p>
        </div>
      )}
    </div>
  );
};

export default ApkDownloadsPage;