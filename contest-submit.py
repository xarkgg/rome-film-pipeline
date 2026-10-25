#!/usr/bin/env python3
"""Upload one authorized Lab entry and submit it for review (Python 3 stdlib)."""
import argparse
import getpass
import json
import mimetypes
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

ORIGIN = 'https://www.sandbase.ai'

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--entry', required=True)
    parser.add_argument('--contest', default='city-life')
    parser.add_argument('--metadata', required=True)
    parser.add_argument('--video', required=True)
    parser.add_argument('--cover', required=True)
    args = parser.parse_args()
    import re
    if not re.fullmatch(r'[0-9a-f-]{36}', args.entry) or not re.fullmatch(r'[a-z0-9-]{2,40}', args.contest):
        parser.error('Invalid entry or contest')
    token = (os.environ.get('LAB_SUBMISSION_TOKEN') or getpass.getpass('Lab submission authorization: ')).strip()
    recovery = f'{ORIGIN}/lab/event/aicityremix/mine?upload={args.entry}'
    if not re.fullmatch(r'lab_entry_' + re.escape(args.entry) + r'_[0-9a-f]{64}', token):
        raise RuntimeError('Authorization does not match this entry. Keep your files and get resume instructions at: ' + recovery)
    base = f'{ORIGIN}/lab/api/contests/{args.contest}/entries/{args.entry}'
    opener = urllib.request.build_opener(NoRedirect())

    def request(action='', method='GET', data=None, content_type='application/json'):
        if isinstance(data, dict):
            data = json.dumps(data).encode()
        req = urllib.request.Request(base + action, data=data, method=method, headers={
            'Authorization': 'Bearer ' + token, 'Content-Type': content_type,
            # sandbase.ai sits behind Cloudflare, which rejects the default
            # python-urllib User-Agent with an HTML 403 (error code 1010).
            'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
        })
        try:
            with opener.open(req, timeout=120) as response:
                result = json.load(response)
        except urllib.error.HTTPError as error:
            if error.code == 401:
                raise RuntimeError('Upload authorization is invalid or expired. Keep your files; sign in as the entry owner and copy new resume instructions at: ' + recovery) from None
            # Never echo a URL, authorization, or arbitrary upstream error body.
            try:
                result = json.load(error)
                fields = [item.get('field') for item in result.get('errors', [])]
            except (ValueError, AttributeError):
                fields = []
            raise RuntimeError(f'Lab request failed (HTTP {error.code}); check fields: {fields or "return to Lab and retry"}') from None
        if 'data' not in result:
            raise RuntimeError('Invalid Lab response')
        return result['data']

    metadata = json.loads(Path(args.metadata).read_text())
    video = Path(args.video)
    cover = Path(args.cover)
    if not 0 < video.stat().st_size <= 100 * 1024 * 1024 or not 0 < cover.stat().st_size <= 5 * 1024 * 1024:
        raise RuntimeError('Files must be nonempty; video at most 100 MiB, cover at most 5 MiB.')
    current = request()
    if current.get('status') in ('pending', 'approved'):
        print('Already submitted:', current['status'])
        return
    request(method='PUT', data=metadata)
    request('/cover', 'PUT', cover.read_bytes(), mimetypes.guess_type(cover.name)[0] or 'application/octet-stream')
    upload = request('/video/start', 'POST', {'bytes': video.stat().st_size})
    query = '?' + urllib.parse.urlencode({'upload_id': upload['upload_id'], 'token': upload['token']})
    parts = []
    try:
        with video.open('rb') as stream:
            for number in range(1, upload['parts'] + 1):
                chunk = stream.read(upload['part_size'])
                parts.append(request('/video/part' + query + f'&n={number}', 'PUT', chunk, 'application/octet-stream'))
        request('/video/complete' + query, 'POST', {'parts': parts})
    except Exception:
        try:
            request('/video/abort' + query, 'POST')
        except Exception:
            pass
        raise
    result = request('/submit', 'POST')
    if result.get('status') not in ('pending', 'approved'):
        raise RuntimeError('Submission not confirmed; return to Lab to check.')
    print('Submitted for review. Return to https://www.sandbase.ai/lab/event/aicityremix')

if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, ValueError, urllib.error.URLError) as error:
        # Local filenames and network exception strings may contain private data.
        print(str(error) if isinstance(error, RuntimeError) else 'Upload failed. Check local files and connectivity, then retry.')
        raise SystemExit(1)
