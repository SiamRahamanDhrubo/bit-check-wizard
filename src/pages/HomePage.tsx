import { ArrowDown, ArrowRight, Laptop, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage = () => (
  <>
    <section className="home-hero" aria-labelledby="home-heading">
      <div className="home-hero-inner">
        <p className="eyebrow"><span className="status-dot" /> Minecraft downloads made simple</p>
        <h1 id="home-heading">MC<span>EDIT</span></h1>
        <p className="home-hero-copy">Choose your Minecraft edition and find the version for your device.</p>
        <div className="home-hero-actions">
          <Button asChild size="lg" className="hero-primary-action">
            <Link to="/apks">Explore Android APKs <ArrowRight aria-hidden="true" /></Link>
          </Button>
          <a className="hero-secondary-action" href="#downloads">
            Browse downloads <ArrowDown aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="hero-image-credit">A world of your own</div>
    </section>

    <section className="download-index page-width" id="downloads" aria-labelledby="downloads-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Select your edition</p>
          <h2 id="downloads-heading">Downloads</h2>
        </div>
        <p className="section-heading-note">Pick a platform to see the available versions and instructions.</p>
      </div>
      <div className="download-choice-grid">
        <Link className="download-choice" to="/apks">
          <span className="choice-icon choice-icon-green"><Smartphone aria-hidden="true" /></span>
          <span className="choice-copy">
            <span className="choice-kicker">ANDROID</span>
            <span className="choice-title">Minecraft APKs</span>
            <span className="choice-description">Choose an architecture and music option.</span>
          </span>
          <ArrowRight className="choice-arrow" aria-hidden="true" />
        </Link>
        <Link className="download-choice" to="/pc">
          <span className="choice-icon choice-icon-cyan"><Laptop aria-hidden="true" /></span>
          <span className="choice-copy">
            <span className="choice-kicker">WINDOWS</span>
            <span className="choice-title">Minecraft for PC</span>
            <span className="choice-description">View the PC download status and setup guide.</span>
          </span>
          <ArrowRight className="choice-arrow" aria-hidden="true" />
        </Link>
      </div>
    </section>
  </>
);

export default HomePage;