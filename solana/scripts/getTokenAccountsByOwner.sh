curl http://34.224.93.52:8899 -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getTokenAccountsByOwner",
    "params": [
      "5pEQEkEFwwYAZFpBCrjkp1mwPBy1RarUT8waw9LwQL8p",
      {
        "mint": "6fg1v6BcLTme2rqsrgKTQRwZh6Funy5Nj7dRrNZh89vz"
      },
      {
        "encoding": "jsonParsed"
      }
    ]
  }
'
