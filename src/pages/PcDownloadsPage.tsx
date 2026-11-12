import { ArrowLeft, Laptop, MonitorDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InstructionsDialog } from '@/components/mcedit/SiteShell';

const microsoftStoreUrl = 'https://www.xbox.com/en-US/games/store/minecraft-for-windows/9nblggh2jhxj?ocid';

const PcDownloadsPage = () => (
  <div className="content-page page-width pc-page">
    <div className="page-intro">
      <Link className="back-link" to="/" aria-label="Back to MCEDIT home">
        <ArrowLeft aria-hidden="true" /> Home
      </Link>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Windows edition</p>
          <h1>Minecraft for PC</h1>
          <p className="page-lede">Windows only. Find the PC package and setup instructions here.</p>
        </div>
        <InstructionsDialog
          title="Minecraft for PC: Instructions"
          description=""
        >
          <ol className="instruction-list pc-instruction-list">
            <li>
              Download the Minecraft for Windows demo from the official Microsoft Store.
              <span className="instruction-link-label">Microsoft Store link:</span>
              <a href={microsoftStoreUrl} target="_blank" rel="noreferrer">{microsoftStoreUrl}</a>
            </li>
            <li>Download the ZIP file from mcedit-site.lovable.app named MCFWF1.0.zip.</li>
            <li>Unzip it to X:\XboxGames\Minecraft for Windows\Content, where X is the drive letter where the game was installed.</li>
            <li>Launch Minecraft from the Start menu and now Play!</li>
          </ol>
        </InstructionsDialog>
      </div>
    </div>

    <section className="pc-download-section" aria-labelledby="pc-download-heading">
      <div className="pc-download-icon"><Laptop aria-hidden="true" /></div>
      <div className="pc-download-copy">
        <p className="eyebrow">Windows only</p>
        <h2 id="pc-download-heading">Minecraft for Windows</h2>
        <p className="page-lede">The requested package is MCFWF1.0.zip.</p>
      </div>
      <div className="pc-download-action">
        <Button disabled className="pc-download-button">
          <MonitorDown aria-hidden="true" /> MCFWF1.0.zip not uploaded
        </Button>
        <span className="unavailable-note">This download will be available when the ZIP file is added.</span>
      </div>
    </section>
    <a className="store-link" href={microsoftStoreUrl} target="_blank" rel="noreferrer">
      Minecraft for Windows on Microsoft Store <span aria-hidden="true">↗</span>
    </a>
  </div>
);

export default PcDownloadsPage;