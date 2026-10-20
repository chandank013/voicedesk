import urllib.request
import json

def test_utterance(text):
    data = json.dumps({'utterance': text, 'source': 'simulator'}).encode('utf-8')
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/simulator/utterance',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as res:
        out = json.loads(res.read().decode('utf-8'))
        print(f"UTTERANCE: \"{text}\"")
        print(f"  -> TOOL: {out['tool']} ({out['latency_ms']} ms, ok={out['ok']})")
        print(f"  -> SPEECH: {out['speech']}\n")

if __name__ == "__main__":
    test_utterance("Add call the bank tomorrow")
    test_utterance("What's on my list today?")
    test_utterance("Note: use SQLite for the demo")
    test_utterance("What did I note about SQLite?")
    test_utterance("Mark call the bank done")
