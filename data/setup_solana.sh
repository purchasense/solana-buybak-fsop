. "$HOME/.cargo/env"
export PATH=/root/.local/share/solana/install/active_release/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

solana config set --keypair /home/user/gitrepo/solana-buybak-fsop/data/my-keypair.json --url https://api.devnet.solana.com
solana-keygen pubkey /home/user/gitrepo/solana-buybak-fsop/data/my-keypair.json
solana account 6fg1v6BcLTme2rqsrgKTQRwZh6Funy5Nj7dRrNZh89vz
#solana program deploy --program-id dist/program/solana_buybak_fsop-keypair.json dist/program/solana_buybak_fsop.so
