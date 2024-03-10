# solana-buybak-fsop
Buybak.xyz Fractional Stock Ownership Plan on SOLANA (preliminary repo)

# How to run
1. ./solana-test-validator --bpf-program solana_buybak_fsop-keypair.json solana_buybak_fsop.so
2. solana config get
  Config File: /Users/sameer/.config/solana/cli/config.yml
  RPC URL: http://34.224.93.52:8899
  WebSocket URL: ws://34.224.93.52:8900/ (computed)
  Keypair Path: /Users/sameer/gitrepo/solana/cmdline/my-solana-wallet/my-keypair.json
  Commitment: processed
3. solana airdrop 5 (on my-keypair.json)
4. Now run test programs (NodeJS) to populate FSOP aaccounts
    run_live_stock_quotes.sh*
    run_user_profile.sh*
    run_user_portfolio.sh*
    fetch_user_portfolio.sh*
    fetch_user_profiles.sh*

5. Output attached herein.
