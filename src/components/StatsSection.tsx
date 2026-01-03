import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { LAUNCHER_ADDRESS, LAUNCHER_ABI } from '@/lib/contract';
import { Rocket, Coins, TrendingUp } from 'lucide-react';

export function StatsSection() {
  const { data: totalLaunches } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'totalLaunches',
  });

  const { data: totalFeesCollected } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'totalFeesCollected',
  });

  const { data: minLaunchEth } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'minLaunchEth',
  });

  const { address } = useAccount();

  const { data: userLaunchCount } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'getCreatorLaunchCount',
    args: address ? [address] : undefined,
  });

  const stats = [
    {
      label: 'Total Launches',
      value: totalLaunches?.toString() || '0',
      icon: Rocket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Fees Collected',
      value: totalFeesCollected ? `${Number(formatEther(totalFeesCollected)).toFixed(4)} ETH` : '0 ETH',
      icon: Coins,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Min Launch ETH',
      value: minLaunchEth ? `${formatEther(minLaunchEth)} ETH` : '0.1 ETH',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <section className="w-full px-4 sm:px-0">
      <div className="text-center mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">Platform Stats</h2>
        <p className="text-sm text-muted-foreground">Real-time metrics from the Base ecosystem</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <div className={`p-3 sm:p-4 rounded-xl ${stat.bgColor} ring-1 ring-border/20`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {address && userLaunchCount !== undefined && userLaunchCount > 0n && (
        <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <p className="text-sm text-muted-foreground">
            You've launched <span className="text-primary font-bold">{userLaunchCount.toString()}</span> meme token{userLaunchCount > 1n ? 's' : ''}! 🚀
          </p>
        </div>
      )}
    </section>
  );
}
