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
      <Button variant="outline" onClick={() => disconnect()}>
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button variant="glow" onClick={() => connect({ connector: injected() })}>
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">BaseMemeLauncher</h1>
              <p className="text-xs text-muted-foreground">Base Sepolia</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-12">
        <section className="text-center space-y-6 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />Launch in 30 seconds
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Launch your <span className="text-primary text-glow">meme</span> on Base
            <br /><span className="text-secondary text-glow-purple">instant liquidity!</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create your token, add Uniswap V3 liquidity, and start trading — all in one transaction.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
              <Shield className="w-4 h-4 text-accent" /><span className="text-foreground">1% Launch Fee</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
              <Droplets className="w-4 h-4 text-primary" /><span className="text-foreground">Instant Uniswap LP</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
              <Rocket className="w-4 h-4 text-secondary" /><span className="text-foreground">Mainnet Ready</span>
            </div>
          </div>
        </section>

        <StatsSection />
        <section className="max-w-lg mx-auto"><LauncherInterface /></section>
        <RecentLaunches />
        <div className="max-w-lg mx-auto"><AdminPanel /></div>

        <footer className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">Contract: <code className="text-xs font-mono text-primary">0xc1c77747448f7d86e9a911e70773fc9EE4504976</code></p>
          <p className="text-xs text-muted-foreground mt-2">Built for Base builders 🔵</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
