import { LauncherInterface } from '@/components/LauncherInterface';
import { StatsSection } from '@/components/StatsSection';
import { RecentLaunches } from '@/components/RecentLaunches';
import { AdminPanel } from '@/components/AdminPanel';
import { Rocket, Zap, Shield, Droplets } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { injected } from 'wagmi/connectors';

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()} className="text-xs sm:text-sm">
        {address.slice(0, 4)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button variant="glow" onClick={() => connect({ connector: injected() })} className="text-xs sm:text-sm">
      Connect Wallet
    </Button>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-foreground">BaseMemeLauncher</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Base Sepolia</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-10 lg:space-y-12">
        <section className="text-center space-y-4 sm:space-y-6 py-4 sm:py-6 lg:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-medium">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />Launch in 30 seconds
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight px-4">
            Launch your <span className="text-primary text-glow">meme</span> on Base
            <br /><span className="text-secondary text-glow-purple">instant liquidity!</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Create your token, add Uniswap V3 liquidity, and start trading — all in one transaction.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2 sm:pt-4 px-4">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card border border-border text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-accent" /><span className="text-foreground">1% Launch Fee</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card border border-border text-xs sm:text-sm">
              <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-primary" /><span className="text-foreground">Instant Uniswap LP</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card border border-border text-xs sm:text-sm">
              <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" /><span className="text-foreground">Mainnet Ready</span>
            </div>
          </div>
        </section>

        <StatsSection />
        <section className="max-w-lg mx-auto px-4 sm:px-0"><LauncherInterface /></section>
        <RecentLaunches />
        <div className="max-w-lg mx-auto px-4 sm:px-0"><AdminPanel /></div>

        <footer className="text-center py-6 sm:py-8 border-t border-border px-4">
          <p className="text-xs sm:text-sm text-muted-foreground break-all sm:break-normal">Contract: <code className="text-xs font-mono text-primary">0xc1c77747448f7d86e9a911e70773fc9EE4504976</code></p>
          <p className="text-xs text-muted-foreground mt-2">Built for Base builders 🔵</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
