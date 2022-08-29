import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey, Transaction, TransactionInstruction, TransactionSignature,
} from '@solana/web3.js';
import { FC, useCallback, useMemo } from 'react';
import { Staking } from '@pngfi/sdk';
import {
  DEFAULT_PROVIDER_OPTIONS,
  SolanaAugmentedProvider,
  SolanaProvider,
  SolanaReadonlyProvider,
} from '@saberhq/solana-contrib';

export const SendTransaction: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet, connected } = useWallet();

  const provider = useMemo(() =>
    wallet && connected ?
      new SolanaAugmentedProvider(
        SolanaProvider.init({
          connection,
          wallet: wallet.adapter as any,
          opts: DEFAULT_PROVIDER_OPTIONS,
        })
      ) :
      new SolanaReadonlyProvider(connection, {
        commitment: 'processed',
      }),
    [wallet, connected, connection]
  );

  const stakingModel = useMemo(() => {
    return new Staking(
      provider as any,
      {
        address: new PublicKey("stKsnrU3uRnht6bVBbi5Zm6sM3Tj5zR3iHzBDR4ZBXC"),
        vestConfig: new PublicKey("CxHKqMnY8bf8NsmhfC4AbwYy9Hg1rCYHmRdbgBwnojs3") as any,
      },
      {
        rewardsHolder: new PublicKey("EubEfNA5vn31xERPQsTBW312KogssTq7Ni4Js3XSo7y7"),
        tokenHolder: new PublicKey("F7AkpGvjsXaUVW49mMMgyKQzToFxJvHSZjwB6EUta1W"),
        claimableMint: new PublicKey('BUD1144GGYwmMRFs4Whjfkom5UHqC9a8dZHPVvR2vfPx')
      }
    )
  }, [provider]);


  const onClick = useCallback(async () => {
    if (!publicKey) {
      console.error('error', 'Wallet not connected!');
      return;
    }

    let signature: TransactionSignature = '';
    try {
      const [rebaseTx] = await Promise.all([
        stakingModel.rebase()
      ]);

      console.log(rebaseTx);
  
      const signature = (await rebaseTx.confirm()).signature;

      console.log('signature', signature);
    } catch (error: any) {
      console.log('error', error);
      return;
    }
  }, [publicKey, connection, sendTransaction]);

  return (
    <button onClick={onClick} disabled={!publicKey}>
      Send Transaction
    </button>
  );
};
