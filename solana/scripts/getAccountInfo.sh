curl http://34.224.93.52:8899 -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getAccountInfo",
    "params": [
      "8vHG2e5qxk7SJ9eca7AKV9neWTQrFXEQkRrvpexAKiti",
      {
        "encoding": "base58"
      }
    ]
  }
'
